import MixinStorage "blob-storage/Mixin";
import Storage "blob-storage/Storage";
import Map "mo:core/Map";
import Nat "mo:core/Nat";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import List "mo:core/List";
import Iter "mo:core/Iter";
import Time "mo:core/Time";
import Text "mo:core/Text";
import OutCall "http-outcalls/outcall";
import AccessControl "authorization/access-control";
import MixinAuthorization "authorization/MixinAuthorization";
import Set "mo:core/Set";
import Array "mo:core/Array";

actor {
  include MixinStorage();

  public type RoomType = { #publicRoom; #privateRoom };

  public type Message = {
    sender : Principal;
    content : Text;
    timestamp : Time.Time;
  };

  public type ProficiencyLevel = {
    language : Text;
    level : Text;
  };

  public type UserProfile = {
    name : Text;
    primaryLanguage : Text;
    interests : [Text];
    proficiencyLevels : [ProficiencyLevel];
    profilePicture : ?Storage.ExternalBlob;
    selfIntroduction : Text;
    likes : Text;
    dislikes : Text;
    hobbies : Text;
    favoriteTravelDestinations : Text;
    location : Text;
    education : Text;
    occupation : Text;
    age : ?Nat;
    gender : Text;
    relationshipStatus : Text;
  };

  public type Room = {
    id : Nat;
    name : Text;
    creator : Principal;
    roomType : RoomType;
    allowedUsers : [Text];
    messages : List.List<Message>;
  };

  public type Gift = {
    id : Nat;
    name : Text;
    icon : Storage.ExternalBlob;
    price : Nat;
  };

  public type GiftTransaction = {
    sender : Principal;
    recipient : Principal;
    giftId : Nat;
    roomId : Nat;
    timestamp : Time.Time;
  };

  public type StrangerRoom = {
    id : Nat;
    participants : Set.Set<Principal>;
    messages : List.List<Message>;
    isActive : Bool;
    createdAt : Time.Time;
    lastActive : Time.Time;
  };

  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  // Persistent data structures
  let rooms = Map.empty<Nat, Room>();
  let gifts = Map.empty<Nat, Gift>();
  let giftTransactions = List.empty<GiftTransaction>();
  let userProfiles = Map.empty<Principal, UserProfile>();
  let blockedUsers = Map.empty<Principal, List.List<Principal>>();

  // Variables for ID management
  var nextRoomId = 0;
  var nextStrangerRoomId = 0;

  // Stranger functionality - persistent in actor state
  let strangerWaitingQueue = List.empty<Principal>();
  let strangerRooms = Map.empty<Nat, StrangerRoom>();

  // ------ Room (Friends) Functionality ------

  public shared ({ caller }) func createRoom(name : Text, roomType : RoomType) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create rooms");
    };

    let roomId = nextRoomId;
    rooms.add(
      roomId,
      {
        id = roomId;
        name;
        creator = caller;
        roomType;
        allowedUsers = [caller.toText()];
        messages = List.empty<Message>();
      },
    );
    nextRoomId += 1;
    roomId;
  };

  public shared ({ caller }) func deleteRoom(roomId : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can delete rooms");
    };

    let room = switch (rooms.get(roomId)) {
      case (null) { Runtime.trap("Room does not exist") };
      case (?room) { room };
    };

    if (room.creator != caller) {
      Runtime.trap("Unauthorized: Only the creator can delete the room");
    };

    rooms.remove(roomId);
  };

  public shared ({ caller }) func sendMessage(roomId : Nat, content : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can send messages");
    };

    let room = switch (rooms.get(roomId)) {
      case (null) { Runtime.trap("Room does not exist") };
      case (?room) { room };
    };

    switch (room.roomType) {
      case (#privateRoom) {
        let callerText = caller.toText();
        if (not room.allowedUsers.any<Text>(func(user) { user == callerText })) {
          Runtime.trap("Unauthorized: You are not allowed to send messages in this private room");
        };
      };
      case (#publicRoom) {};
    };

    let message : Message = {
      sender = caller;
      content;
      timestamp = Time.now();
    };

    room.messages.add(message);
  };

  public query ({ caller }) func getRoomMessages(roomId : Nat) : async [Message] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view messages");
    };

    let room = switch (rooms.get(roomId)) {
      case (null) { Runtime.trap("Room does not exist") };
      case (?room) { room };
    };

    switch (room.roomType) {
      case (#publicRoom) {
        room.messages.reverse().toArray();
      };
      case (#privateRoom) {
        let callerText = caller.toText();
        if (not room.allowedUsers.any<Text>(func(user) { user == callerText })) {
          Runtime.trap("Unauthorized: You are not allowed to view messages in this private room");
        };
        room.messages.reverse().toArray();
      };
    };
  };

  // ------ Stranger Functionality ------
  public shared ({ caller }) func joinStrangerQueue() : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can join the stranger queue");
    };

    // Check if already in queue
    let isAlreadyInQueue = strangerWaitingQueue.any(func(p) { p == caller });
    if (isAlreadyInQueue) {
      Runtime.trap("User is already in the stranger waiting queue");
    };

    strangerWaitingQueue.add(caller);
  };

  public shared ({ caller }) func removeFromStrangerQueue() : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can remove from the stranger queue");
    };
    strangerWaitingQueue.clear();
  };

  public shared ({ caller }) func createStrangerRoom() : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create stranger rooms");
    };

    let roomId = nextStrangerRoomId;
    let participants = Set.empty<Principal>();
    participants.add(caller);

    let newRoom : StrangerRoom = {
      id = roomId;
      participants;
      messages = List.empty<Message>();
      isActive = false;
      createdAt = Time.now();
      lastActive = Time.now();
    };

    strangerRooms.add(roomId, newRoom);
    nextStrangerRoomId += 1;
    roomId;
  };

  public shared ({ caller }) func pairWithStranger() : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can pair with strangers");
    };

    let availableUsers = strangerWaitingQueue.reverse().toArray();
    if (availableUsers.size() == 0) {
      Runtime.trap("No available strangers to pair with");
    };

    let selectedPartner = availableUsers[0];
    let remainingQueue = strangerWaitingQueue.reverse().toArray().sliceToArray(1, availableUsers.size() - 1);
    strangerWaitingQueue.clear();
    let reversedRemaining = if (remainingQueue.size() > 0) {
      remainingQueue.sliceToArray(0, remainingQueue.size());
    } else { [] };
    for (participant in reversedRemaining.values()) {
      strangerWaitingQueue.add(participant);
    };

    let roomId = await createStrangerRoom();
    let participants = Set.empty<Principal>();
    participants.add(caller);
    participants.add(selectedPartner);

    let newRoom : StrangerRoom = {
      id = nextStrangerRoomId;
      participants;
      messages = List.empty<Message>();
      isActive = true;
      createdAt = Time.now();
      lastActive = Time.now();
    };

    strangerRooms.add(roomId, newRoom);
    nextStrangerRoomId += 1;
    roomId;
  };

  public shared ({ caller }) func sendStrangerRoomMessage(roomId : Nat, content : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can send messages");
    };

    let room = switch (strangerRooms.get(roomId)) {
      case (null) {
        Runtime.trap("StrangerRoom does not exist");
      };
      case (?room) { room };
    };

    if (not room.participants.contains(caller)) {
      Runtime.trap("Unauthorized: You are not a participant in this stranger room");
    };

    if (not room.isActive) {
      Runtime.trap("Unauthorized: This stranger room is not active");
    };

    let message : Message = {
      sender = caller;
      content;
      timestamp = Time.now();
    };

    room.messages.add(message);
  };

  public query ({ caller }) func getStrangerRoomMessages(roomId : Nat) : async [Message] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view messages");
    };

    let room = switch (strangerRooms.get(roomId)) {
      case (null) {
        Runtime.trap("StrangerRoom does not exist");
      };
      case (?room) { room };
    };

    if (not room.participants.contains(caller)) {
      Runtime.trap("Unauthorized: You are not a participant in this stranger room");
    };

    room.messages.reverse().toArray();
  };

  // ------ Shared Functionality ------
  // Translation API
  public query func transform(input : OutCall.TransformationInput) : async OutCall.TransformationOutput {
    OutCall.transform(input);
  };

  public shared ({ caller }) func translateText(
    text : Text,
    sourceLang : Text,
    targetLang : Text,
  ) : async Text {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can translate text");
    };
    let url = "https://api.example.com/translate?text=" # text # "&source=" # sourceLang # "&target=" # targetLang;
    await OutCall.httpGetRequest(url, [], transform);
  };

  // Blocking users
  public shared ({ caller }) func blockUser(target : Principal) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can block others");
    };

    let currentBlocks = switch (blockedUsers.get(caller)) {
      case (null) { List.empty<Principal>() };
      case (?blocks) { blocks };
    };

    currentBlocks.add(target);
    blockedUsers.add(caller, currentBlocks);
  };

  public query ({ caller }) func isBlocked(target : Principal) : async Bool {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can check blocked status");
    };
    let currentBlocks = switch (blockedUsers.get(caller)) {
      case (null) { List.empty<Principal>() };
      case (?blocks) { blocks };
    };
    currentBlocks.any(func(user) { user == target });
  };

  public query ({ caller }) func getGiftCatalog() : async [Gift] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view gift catalog");
    };
    gifts.values().toArray();
  };

  public shared ({ caller }) func sendGift(
    roomId : Nat,
    recipient : Principal,
    giftId : Nat,
  ) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can send gifts");
    };

    let room = switch (rooms.get(roomId)) {
      case (null) { Runtime.trap("Room does not exist") };
      case (?room) { room };
    };

    switch (room.roomType) {
      case (#privateRoom) {
        let callerText = caller.toText();
        if (not room.allowedUsers.any<Text>(func(user) { user == callerText })) {
          Runtime.trap("Unauthorized: You are not allowed to send gifts in this private room");
        };
      };
      case (#publicRoom) {};
    };

    switch (gifts.get(giftId)) {
      case (null) { Runtime.trap("Gift does not exist") };
      case (?_) {};
    };

    let transaction : GiftTransaction = {
      sender = caller;
      recipient;
      giftId;
      roomId;
      timestamp = Time.now();
    };

    giftTransactions.add(transaction);
  };

  public query ({ caller }) func getRoomGiftHistory(roomId : Nat) : async [GiftTransaction] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view gift history");
    };

    let room = switch (rooms.get(roomId)) {
      case (null) { Runtime.trap("Room does not exist") };
      case (?room) { room };
    };

    switch (room.roomType) {
      case (#privateRoom) {
        let callerText = caller.toText();
        if (not room.allowedUsers.any<Text>(func(user) { user == callerText })) {
          Runtime.trap("Unauthorized: You are not allowed to view gift history in this private room");
        };
      };
      case (#publicRoom) {};
    };

    giftTransactions
      .toArray()
      .filter(func(t) { t.roomId == roomId })
      .reverse();
  };

  // User profile functionality
  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view profiles");
    };
    userProfiles.get(user);
  };
};
