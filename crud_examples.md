# Clustr Database CRUD Examples

This guide provides example Mongoose queries for performing CRUD operations across all models in the Clustr application.

## 1. User Model
### Create
```javascript
const user = await User.create({
    fullName: "John Doe",
    username: "johndoe",
    email: "john@example.com",
    password: "hashed_password",
    avatar: { url: "cloudinary_url", public_id: "id" }
});
```
### Read
```javascript
// Find by username
const user = await User.findOne({ username: "johndoe" });

// Get current user (excluding sensitive fields)
const currentUser = await User.findById(userId).select("-password -refreshToken");
```
### Update
```javascript
// Update profile details
const updatedUser = await User.findByIdAndUpdate(
    userId,
    { $set: { fullName: "John Updated" } },
    { new: true }
);
```

---

## 2. Video Model
### Create
```javascript
const video = await Video.create({
    videoFile: { url: "vid_url", public_id: "id" },
    thumbnail: { url: "thumb_url", public_id: "id" },
    title: "My First Video",
    description: "Cool description",
    duration: 120,
    owner: userId
});
```
### Read (with Aggregation)
```javascript
// Fetch all videos with like/comment counts
const videos = await Video.aggregate([
    { $match: { isPublished: true } },
    {
        $lookup: {
            from: "likes",
            localField: "_id",
            foreignField: "likedItem",
            as: "likes"
        }
    },
    { $addFields: { likesCount: { $size: "$likes" } } }
]);
```

---

## 3. Playlist Model
### Create
```javascript
const playlist = await Playlist.create({
    name: "My Favorites",
    description: "Best videos ever",
    owner: userId,
    videos: []
});
```
### Update (Add Video)
```javascript
await Playlist.findByIdAndUpdate(
    playlistId,
    { $addToSet: { videos: videoId } }, // $addToSet prevents duplicates
    { new: true }
);
```
### Delete
```javascript
await Playlist.findByIdAndDelete(playlistId);
```

---

## 4. Comment Model (Polymorphic)
### Create (on Video)
```javascript
const comment = await Comment.create({
    content: "Awesome video!",
    commentOn: videoId,
    onType: "Video",
    owner: userId
});
```
### Read
```javascript
R
```

---

## 5. Like Model (Polymorphic)
### Toggle Like
```javascript
const existingLike = await Like.findOne({ 
    likedBy: userId, 
    likedItem: videoId, 
    itemType: "Video" 
});

if (existingLike) {
    await Like.findByIdAndDelete(existingLike._id);
} else {
    await Like.create({ likedBy: userId, likedItem: videoId, itemType: "Video" });
}
```

---

## 6. Subscription Model
### Create
```javascript
await Subscription.create({
    subscriber: userId,
    channel: channelId
});
```
### Count Subscribers
```javascript
const count = await Subscription.countDocuments({ channel: channelId });
```

---

## 7. Tweet Model
### Create
```javascript
await Tweet.create({
    owner: userId,
    content: "Just joined Clustr!"
});
```

---

## 8. OTP Model (Temporary)
### Create (with Expiry)
```javascript
await OTP.create({
    email: "user@example.com",
    otp: "123456"
});
// Note: expires attribute in schema handles auto-deletion
```
