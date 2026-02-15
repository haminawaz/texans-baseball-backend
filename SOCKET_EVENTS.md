# Socket.io Events Documentation

This document outlines the Socket.io events and payloads used for real-time messaging in the Texans Baseball backend.

## 1. Connection & Room Management
Before receiving updates, the frontend must join the specific thread room.

| Event Name | Direction | Payload | Description |
| :--- | :--- | :--- | :--- |
| `join_thread` | Client → Server | `threadId: string` | Joins a chat room to start receiving real-time updates. |
| `leave_thread` | Client → Server | `threadId: string` | Leaves the chat room. |

---

## 2. Server-to-Client Events (Listen)
The frontend should set up listeners for these events to update the UI in real-time.

### Messaging Events
| Event Name | Payload Structure | Description |
| :--- | :--- | :--- |
| `new_message` | `MessageObject` | Triggered when a new message is sent in the thread. |
| `message_removed` | `{ messageId: string }` | Triggered when a message is deleted. |
| `user_entered_chat` | `{ userId: number, role: 'coach' \| 'player' }` | Triggered when a user opens the thread. |

### Reaction Events
| Event Name | Payload Structure | Description |
| :--- | :--- | :--- |
| `new_reaction` | `ReactionObject` | Triggered when a reaction is added or updated. |
| `reaction_removed` | `{ reactionId: string }` | Triggered when a reaction is removed. |

### Thread Events
| Event Name | Payload Structure | Description |
| :--- | :--- | :--- |
| `thread_deleted` | `{ threadId: string }` | Triggered when an entire thread is deleted. |

---

## 3. Data Structures

### MessageObject
```json
{
  "id": 123,
  "content": "Hello team!",
  "thread_id": 45,
  "sender_type": "coach", // 'coach' | 'player'
  "createdAt": "2024-02-15T12:00:00.000Z",
  "coach": { // Null if sender is player
    "id": 1,
    "first_name": "John",
    "last_name": "Doe",
    "profile_picture": "url"
  },
  "player": { // Null if sender is coach
    "id": 10,
    "first_name": "Jane",
    "last_name": "Smith",
    "profile_picture": "url"
  },
  "reactions": [] 
}
```

### ReactionObject
```json
{
  "id": 567,
  "emoji": "👍",
  "message_id": 123,
  "sender_type": "coach",
  "coach": { "id": 1, "first_name": "John", "last_name": "Doe" },
  "player": null,
  "message": { "thread_id": 45 }
}
```

---

## 4. Implementation Notes
- **Room Convention**: Rooms are named `thread_{threadId}`.
- **Example**: To listen to thread **45**, emit `socket.emit('join_thread', '45')`.
