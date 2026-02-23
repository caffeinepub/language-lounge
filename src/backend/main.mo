import MixinStorage "blob-storage/Mixin";

import Storage "blob-storage/Storage";
import Map "mo:core/Map";
import Nat "mo:core/Nat";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import List "mo:core/List";
import Time "mo:core/Time";
import Text "mo:core/Text";
import Array "mo:core/Array";
import Int "mo:core/Int";
import OutCall "http-outcalls/outcall";
import AccessControl "authorization/access-control";
import MixinAuthorization "authorization/MixinAuthorization";


actor {
  include MixinStorage();

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

  public type RoomType = { #publicRoom; #privateRoom };

  public type Room = {
    id : Nat;
    name : Text;
    creator : Principal;
    roomType : RoomType;
    allowedUsers : [Text];
    messages : List.List<Message>;
  };

  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  let rooms = Map.empty<Nat, Room>();
  let userProfiles = Map.empty<Principal, UserProfile>();
  var nextRoomId = 0;
  let blockedUsers = Map.empty<Principal, List.List<Principal>>();

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

  public query ({ caller }) func getRoomMessages(roomId : Nat) : async [Message] {
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

  public query func transform(input : OutCall.TransformationInput) : async OutCall.TransformationOutput {
    OutCall.transform(input);
  };

  public shared ({ caller }) func translateText(text : Text, sourceLang : Text, targetLang : Text) : async Text {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can translate text");
    };
    let url = "https://api.example.com/translate?text=" # text # "&source=" # sourceLang # "&target=" # targetLang;
    await OutCall.httpGetRequest(url, [], transform);
  };

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
};
