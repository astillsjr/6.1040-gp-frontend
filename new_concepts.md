# API Endpoints for Communication and Notifications Concepts

## Base URL
All endpoints use the base URL: `/api`

## HTTP Method
All endpoints use the `POST` method.

## Communication Concept Endpoints

### 1. Create Conversation
**Endpoint:** `POST /api/Communication/createConversation`

**Request Body:**
```json
{
  "participant1": "user_id_1",
  "participant2": "user_id_2",
  "transaction": "transaction_id"
}
```

**Success Response:**
```json
{
  "conversation": "conversation_id"
}
```

**Error Response:**
```json
{
  "error": "Participants must be different users"
}
```
or
```json
{
  "error": "Conversation already exists for this transaction"
}
```

---

### 2. Send Message
**Endpoint:** `POST /api/Communication/sendMessage`

**Request Body:**
```json
{
  "conversation": "conversation_id",
  "author": "user_id",
  "content": "Message content here"
}
```

**Success Response:**
```json
{
  "message": "message_id"
}
```

**Error Response:**
```json
{
  "error": "Conversation not found"
}
```
or
```json
{
  "error": "Author must be a participant in the conversation"
}
```

**Note:** Messages are automatically pushed to the other participant via SSE if they are connected.

---

### 3. Mark Message Read
**Endpoint:** `POST /api/Communication/markMessageRead`

**Request Body:**
```json
{
  "message": "message_id"
}
```

**Success Response:**
```json
{}
```

**Error Response:**
```json
{
  "error": "Message not found"
}
```
or
```json
{
  "error": "Message already read"
}
```

---

### 4. Mark Conversation Read
**Endpoint:** `POST /api/Communication/markConversationRead`

**Request Body:**
```json
{
  "conversation": "conversation_id",
  "user": "user_id"
}
```

**Success Response:**
```json
{}
```

**Error Response:**
```json
{
  "error": "Conversation not found"
}
```
or
```json
{
  "error": "User must be a participant in the conversation"
}
```

**Note:** Marks all unread messages from the other participant as read.

---

### 5. Get Messages (Query)
**Endpoint:** `POST /api/Communication/_getMessages`

**Request Body:**
```json
{
  "conversation": "conversation_id"
}
```

**Success Response:** (Returns an array)
```json
[
  {
    "messages": [
      {
        "_id": "message_id",
        "conversation": "conversation_id",
        "author": "user_id",
        "content": "Message content",
        "createdAt": "2024-01-01T00:00:00.000Z",
        "readAt": null
      }
    ]
  }
]
```

**Error Response:**
```json
{
  "error": "Messages not found"
}
```

---

### 6. Get Conversation (Query)
**Endpoint:** `POST /api/Communication/_getConversation`

**Request Body:**
```json
{
  "conversation": "conversation_id"
}
```

**Success Response:** (Returns an array)
```json
[
  {
    "conversationDoc": {
      "_id": "conversation_id",
      "participant1": "user_id_1",
      "participant2": "user_id_2",
      "transaction": "transaction_id",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "lastMessageAt": "2024-01-01T00:00:00.000Z"
    }
  }
]
```

**Note:** Returns empty array `[]` if conversation not found.

---

### 7. Get Conversation by Transaction (Query)
**Endpoint:** `POST /api/Communication/_getConversationByTransaction`

**Request Body:**
```json
{
  "transaction": "transaction_id"
}
```

**Success Response:** (Returns an array)
```json
[
  {
    "conversation": {
      "_id": "conversation_id",
      "participant1": "user_id_1",
      "participant2": "user_id_2",
      "transaction": "transaction_id",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "lastMessageAt": "2024-01-01T00:00:00.000Z"
    }
  }
]
```

---

### 8. Get Conversations by User (Query)
**Endpoint:** `POST /api/Communication/_getConversationsByUser`

**Request Body:**
```json
{
  "user": "user_id"
}
```

**Success Response:**
```json
{
  "conversations": [
    {
      "_id": "conversation_id",
      "participant1": "user_id_1",
      "participant2": "user_id_2",
      "transaction": "transaction_id",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "lastMessageAt": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

---

### 9. Get Unread Messages by User (Query)
**Endpoint:** `POST /api/Communication/_getUnreadMessagesByUser`

**Request Body:**
```json
{
  "user": "user_id"
}
```

**Success Response:** (Returns an array of message documents)
```json
[
  {
    "_id": "message_id",
    "conversation": "conversation_id",
    "author": "other_user_id",
    "content": "Message content",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "readAt": null
  }
]
```

**Note:** Returns messages sorted by creation date (newest first), only from conversations where the user is a participant, and only messages where the user is NOT the author.

---

## Notifications Concept Endpoints

### 1. Create and Send Notification
**Endpoint:** `POST /api/Notifications/createAndSendNotification`

**Request Body:**
```json
{
  "recipient": "user_id",
  "type": "ITEM_EXPIRED",
  "context": {
    "itemId": "item_id",
    "itemName": "Item Name",
    "userName": "User Name",
    "otherUserName": "Other User Name"
  }
}
```

**Notification Types:**
- `ITEM_EXPIRED`
- `ITEM_CLAIMED`
- `ITEM_RETURNED`
- `ITEM_LOST`
- `ITEM_FOUND`
- `ITEM_UPDATED`
- `ITEM_DELETED`
- `ITEM_REMOVED`
- `ITEM_CLAIMED_BY_OTHER`
- `ITEM_RETURNED_BY_OTHER`
- `ITEM_LOST_BY_OTHER`
- `ITEM_FOUND_BY_OTHER`
- `ITEM_UPDATED_BY_OTHER`
- `ITEM_DELETED_BY_OTHER`
- `ITEM_REMOVED_BY_OTHER`

**Success Response:**
```json
{
  "notification": "notification_id"
}
```

**Error Response:**
```json
{
  "error": "Error message here"
}
```

**Note:** Notification is automatically pushed to the recipient via SSE if they are connected. The title and content are automatically constructed from the type and context.

---

### 2. Mark Notification Read
**Endpoint:** `POST /api/Notifications/markNotificationRead`

**Request Body:**
```json
{
  "notification": "notification_id"
}
```

**Success Response:**
```json
{}
```

**Error Response:**
```json
{
  "error": "Notification not found"
}
```

---

### 3. Get Notification (Query)
**Endpoint:** `POST /api/Notifications/_getNotification`

**Request Body:**
```json
{
  "notification": "notification_id"
}
```

**Success Response:** (Returns an array)
```json
[
  {
    "notificationDoc": {
      "_id": "notification_id",
      "recipient": "user_id",
      "type": "ITEM_EXPIRED",
      "title": "Item Expired",
      "content": "Item Name has expired and is no longer available.",
      "status": "SENT",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "readAt": null
    }
  }
]
```

**Note:** Returns empty array `[]` if notification not found.

---

### 4. Get Notifications by Recipient (Query)
**Endpoint:** `POST /api/Notifications/_getNotificationsByRecipient`

**Request Body:**
```json
{
  "recipient": "user_id"
}
```

**Success Response:** (Returns an array of notification documents)
```json
[
  {
    "_id": "notification_id",
    "recipient": "user_id",
    "type": "ITEM_EXPIRED",
    "title": "Item Expired",
    "content": "Item Name has expired and is no longer available.",
    "status": "SENT",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "readAt": null
  }
]
```

**Note:** Returns notifications sorted by creation date (newest first).

---

### 5. Get Unread Notifications by Recipient (Query)
**Endpoint:** `POST /api/Notifications/_getUnreadNotificationsByRecipient`

**Request Body:**
```json
{
  "recipient": "user_id"
}
```

**Success Response:** (Returns an array of notification documents)
```json
[
  {
    "_id": "notification_id",
    "recipient": "user_id",
    "type": "ITEM_EXPIRED",
    "title": "Item Expired",
    "content": "Item Name has expired and is no longer available.",
    "status": "SENT",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "readAt": null
  }
]
```

**Note:** Returns only unread notifications (where `readAt` is `null`), sorted by creation date (newest first).

---

## Real-time Updates via SSE

Both Communication and Notifications concepts support real-time updates via Server-Sent Events (SSE). When messages or notifications are created, they are automatically pushed to connected users through the SSE stream.

**SSE Event Types:**
- `message` - New message received (Communication)
- `notification` - New notification received (Notifications)

**SSE Event Format:**
```json
{
  "type": "message",
  "message": {
    "_id": "message_id",
    "conversation": "conversation_id",
    "author": "user_id",
    "content": "Message content",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "readAt": null
  }
}
```

or

```json
{
  "type": "notification",
  "notification": {
    "_id": "notification_id",
    "recipient": "user_id",
    "type": "ITEM_EXPIRED",
    "title": "Item Expired",
    "content": "Item Name has expired and is no longer available.",
    "status": "SENT",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "readAt": null
  }
}
```

