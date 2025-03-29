require("dotenv").config()
const mongoose = require("mongoose")
const bcrypt = require("bcryptjs")
const Movie = require("../models/Movie")
const User = require("../models/User")
const Review = require("../models/Review")

// Connect to MongoDB
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("MongoDB connected for seeding"))
  .catch((err) => {
    console.error("MongoDB connection error:", err)
    process.exit(1)
  })

// Sample data
const movies = [
  {
    title: "Devara",
    year: 2024,
    genres: ["Action", "Drama", "Thriller"],
    language: "Telugu",
    director: "Koratala Siva",
    cast: ["Jr. NTR", "Janhvi Kapoor", "Saif Ali Khan"],
    plot: "Devara is a grand spectacle that immerses you in a visually stunning world, brought to life by breathtaking cinematography and accompanied by a mesmerizing musical score.",
    poster: "/placeholder.svg?height=450&width=300",
    backdrop: "/placeholder.svg?height=800&width=1400",
    rating: 8.2,
    runtime: 155,
    releaseDate: new Date("2024-04-05"),
    category: "in-theatres",
  },
  {
    title: "Manjummel Boys",
    year: 2024,
    genres: ["Drama", "Thriller", "Adventure"],
    language: "Malayalam",
    director: "Chidambaram",
    cast: ["Soubin Shahir", "Sreenath Bhasi", "Balu Varghese"],
    plot: "A group of friends from Manjummel embark on a vacation to Kodaikanal, where they decide to explore the infamous Guna Caves, leading to a life-threatening situation.",
    poster: "/placeholder.svg?height=450&width=300",
    backdrop: "/placeholder.svg?height=800&width=1400",
    rating: 8.5,
    runtime: 140,
    releaseDate: new Date("2024-02-22"),
    category: "top-rated",
  },
  {
    title: "RRR",
    year: 2022,
    genres: ["Action", "Drama", "Historical"],
    language: "Telugu",
    director: "S.S. Rajamouli",
    cast: ["N.T. Rama Rao Jr.", "Ram Charan", "Alia Bhatt"],
    plot: "A fictional story about two legendary revolutionaries and their journey away from home before they started fighting for their country in the 1920s.",
    poster: "/placeholder.svg?height=450&width=300",
    backdrop: "/placeholder.svg?height=800&width=1400",
    rating: 9.0,
    runtime: 187,
    releaseDate: new Date("2022-03-25"),
    category: "top-rated",
  },
  {
    title: "Pushpa 2: The Rule",
    year: 2024,
    genres: ["Action", "Crime", "Thriller"],
    language: "Telugu",
    director: "Sukumar",
    cast: ["Allu Arjun", "Rashmika Mandanna", "Fahadh Faasil"],
    plot: "Pushpa Raj returns to continue his rise in the red sandalwood smuggling syndicate while facing old and new enemies.",
    poster: "/placeholder.svg?height=450&width=300",
    backdrop: "/placeholder.svg?height=800&width=1400",
    rating: 8.7,
    runtime: 165,
    releaseDate: new Date("2024-08-15"),
    category: "coming-soon",
  },
  {
    title: "Amuran",
    year: 2024,
    genres: ["Action", "Adventure"],
    language: "Tamil",
    director: "Vetrimaaran",
    cast: ["Dhanush", "Aishwarya Rajesh"],
    plot: "A tale of revenge and redemption set against the backdrop of rural Tamil Nadu.",
    poster: "/placeholder.svg?height=450&width=300",
    backdrop: "/placeholder.svg?height=800&width=1400",
    rating: 8.3,
    runtime: 150,
    releaseDate: new Date("2024-05-20"),
    category: "upcoming",
  },
]

const users = [
  {
    name: "Yashrajrao7",
    email: "yashraj@example.com",
    username: "yashrajrao7",
    password: "Password@123",
    role: "user",
  },
  {
    name: "Rathod06",
    email: "rathod@example.com",
    username: "rathod06",
    password: "Password@123",
    role: "user",
  },
  {
    name: "Admin User",
    email: "admin@example.com",
    username: "admin",
    password: "Admin@123",
    role: "admin",
  },
]

// Seed function
const seedDatabase = async () => {
  try {
    // Clear existing data
    await Movie.deleteMany({})
    await User.deleteMany({})
    await Review.deleteMany({})

    console.log("Existing data cleared")

    // Create users
    const createdUsers = []
    for (const user of users) {
      const salt = await bcrypt.genSalt(10)
      const hashedPassword = await bcrypt.hash(user.password, salt)

      const newUser = await User.create({
        ...user,
        password: hashedPassword,
      })

      createdUsers.push(newUser)
    }

    console.log(`${createdUsers.length} users created`)

    // Create movies
    const createdMovies = await Movie.insertMany(movies)
    console.log(`${createdMovies.length} movies created`)

    // Create sample reviews
    const reviews = [
      {
        movieId: createdMovies[0]._id,
        userId: createdUsers[0]._id,
        rating: 9,
        title: "R.I.P to the Rajamouli Curse, Tiger Reigns!!!",
        content:
          "Director excelled in presenting it and providing what the fans have been waiting for over the years fan service at it's finest. The film's directed by Koratala Siva strikes a balance of high-octane action with emotional depth & also showcasing his skill for blending mass elements with meaningful content. The action sequences are as epic as the ocean itself, with breathtaking visuals and mind-blowing fight choreography.",
        containsSpoilers: false,
        helpfulCount: 18,
        notHelpfulCount: 5,
      },
      {
        movieId: createdMovies[0]._id,
        userId: createdUsers[1]._id,
        rating: 7,
        title: "A Visual and Musical Extravaganza Elevated by NTR's Performance",
        content:
          '"Devara" is a grand spectacle that immerses you in a visually stunning world, brought to life by breathtaking cinematography and accompanied by a mesmerizing musical score. At its heart lies Jr. NTR\'s extraordinary performance, showcasing his remarkable range and charisma. Anirudh Ravichander\'s music adds another layer of depth and emotion to the narrative, heightening the impact of key moments and enhancing the overall viewing experience. Each song is a masterpiece in its own right, leaving a lasting impression long after the film ends. Overall, "Devara" is a cinematic treat that leaves a lasting impression.',
        containsSpoilers: false,
        helpfulCount: 25,
        notHelpfulCount: 3,
      },
      {
        movieId: createdMovies[1]._id,
        userId: createdUsers[0]._id,
        rating: 5,
        title: "A Thrilling Survival Drama Based on True Events",
        content:
          "Manjummel Boys is a gripping survival thriller that keeps you on the edge of your seat. Based on a true incident, the film follows a group of friends whose vacation takes a terrifying turn when one of them gets trapped in the dangerous Guna Caves. The performances are stellar across the board, with each actor bringing authenticity to their character. The cinematography inside the caves creates a palpable sense of claustrophobia and dread. What makes this film special is how it balances the thrilling rescue mission with the emotional bonds between friends. Highly recommended!",
        containsSpoilers: false,
        helpfulCount: 32,
        notHelpfulCount: 2,
      },
    ]

    const createdReviews = await Review.insertMany(reviews)
    console.log(`${createdReviews.length} reviews created`)

    console.log("Database seeded successfully")
    process.exit(0)
  } catch (error) {
    console.error("Error seeding database:", error)
    process.exit(1)
  }
}

// Run the seed function
seedDatabase()

