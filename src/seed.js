import mongoose from "mongoose";
import { fakerEN as faker } from "@faker-js/faker";
import { User } from "./models/user.model.js";
import { Video } from "./models/video.model.js";
import { Tweet } from "./models/tweet.model.js";
import { Comment } from "./models/comment.model.js";
import { Like } from "./models/like.model.js";
import { Subscription } from "./models/subscription.model.js";
import { Playlist } from "./models/playlist.model.js";
import connectDB from "./db/index.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SEED_PASSWORD = "Password123";
const USER_COUNT = 15;
const VIDEOS_PER_USER = 3;
const TWEETS_PER_USER = 3;

const seed = async () => {
  try {
    await connectDB();
    console.log("Connected to database...");

    console.log("Clearing existing data...");
    await Promise.all([
      User.deleteMany({}),
      Video.deleteMany({}),
      Tweet.deleteMany({}),
      Comment.deleteMany({}),
      Like.deleteMany({}),
      Subscription.deleteMany({}),
      Playlist.deleteMany({}),
    ]);
    console.log("Database cleared.");

    const users = [];
    const credentials = [];

    for (let i = 0; i < USER_COUNT; i++) {
      const firstName = faker.person.firstName();
      const lastName = faker.person.lastName();
      const username = (firstName + lastName).toLowerCase() + faker.number.int(99);
      const email = faker.internet.email({ firstName, lastName }).toLowerCase();

      const user = await User.create({
        username,
        fullName: `${firstName} ${lastName}`,
        email,
        password: SEED_PASSWORD,
        isVerified: true,
        avatar: {
          url: `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`,
          public_id: `avatar_${username}`,
        },
        coverImage: {
          url: `https://picsum.photos/seed/${username}_cover/1200/400`,
          public_id: `cover_${username}`,
        },
      });
      users.push(user);
      credentials.push({ username, email, password: SEED_PASSWORD });
    }

    console.log("Creating English videos and tweets...");
    const allVideos = [];
    const sampleVideos = [
      "https://res.cloudinary.com/demo/video/upload/dog.mp4",
      "https://res.cloudinary.com/demo/video/upload/elephants.mp4",
      "https://res.cloudinary.com/demo/video/upload/sea_turtle.mp4"
    ];

    for (const user of users) {
      for (let i = 0; i < VIDEOS_PER_USER; i++) {
        const titlePrefixes = ["How to", "Amazing", "Top 10", "My", "The Secret of"];
        const title = `${faker.helpers.arrayElement(titlePrefixes)} ${faker.word.adjective()} ${faker.word.noun()}`;
        
        const video = await Video.create({
          title: title.charAt(0).toUpperCase() + title.slice(1),
          description: `In this video, we explore ${faker.company.catchPhrase().toLowerCase()}. This is a great look at ${faker.hacker.ingverb()} ${faker.hacker.adjective()} ${faker.hacker.noun()} for everyone.`,
          videoFile: {
            url: faker.helpers.arrayElement(sampleVideos),
            public_id: `video_${faker.string.uuid()}`,
          },
          thumbnail: {
            url: `https://picsum.photos/seed/${faker.string.uuid()}/640/360`,
            public_id: `thumb_${faker.string.uuid()}`,
          },
          duration: faker.number.int({ min: 60, max: 400 }),
          owner: user._id,
        });
        allVideos.push(video);
      }

      // Create Tweets
      for (let i = 0; i < TWEETS_PER_USER; i++) {
        const tweet = await Tweet.create({
          content: `${faker.hacker.phrase()} #English #Tech`,
          owner: user._id,
        });
        allTweets.push(tweet);
      }
    }

    console.log("Creating social data in English...");
    for (const user of users) {
      // Comments
      const targetVideos = faker.helpers.arrayElements(allVideos, 4);
      for (const video of targetVideos) {
        const comments = [
          "Wow, this is amazing!",
          "I really liked this video.",
          "Could you do a tutorial on this?",
          "Great content as always!",
          "I disagree with this point, but good video.",
          "Subscribed! Love your work."
        ];
        await Comment.create({
          content: faker.helpers.arrayElement(comments),
          commentOn: video._id,
          onType: "Video",
          owner: user._id,
        });
      }

      // Likes
      const likedVideos = faker.helpers.arrayElements(allVideos, 6);
      for (const video of likedVideos) {
        await Like.create({
          likedItem: video._id,
          itemType: "Video",
          likedBy: user._id,
        });
      }

      // Playlists
      await Playlist.create({
        name: `${faker.word.adjective().toUpperCase()} ${faker.word.noun().toUpperCase()} COLLECTION`,
        description: `A collection of my favorite ${faker.word.noun()} videos.`,
        owner: user._id,
        videos: faker.helpers.arrayElements(allVideos, 4).map(v => v._id),
      });
    }

    // Save credentials to file
    const credsPath = path.join(__dirname, "../credentials.txt");
    const credsContent = credentials.map(c => `Username: ${c.username}\nEmail: ${c.email}\nPassword: ${c.password}\n-------------------`).join("\n");
    fs.writeFileSync(credsPath, credsContent);

    console.log("\nDATABASE RESET AND SEEDED WITH REAL ENGLISH CONTENT!");
    process.exit(0);
  } catch (error) {
    console.error("Seeding failed:", error);
    process.exit(1);
  }
};

seed();
