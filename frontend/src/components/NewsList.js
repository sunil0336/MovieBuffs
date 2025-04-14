import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const NewsList = () => {
    const [news, setNews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isHovered, setIsHovered] = useState(false);

    useEffect(() => {
        const fetchNews = async () => {
            try {
                const baseUrl = process.env.REACT_APP_API_URL || "http://localhost:5000/api";
                const apiUrl = `${baseUrl}/news?limit=5`;  

                const res = await fetch(apiUrl);
                if (!res.ok) throw new Error("Failed to fetch news");

                const data = await res.json();
                console.log("News Data:", data); // Debug log

                setNews(Array.isArray(data.news) ? data.news : []); // ✅ Ensure it's always an array
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchNews();
    }, []);

    useEffect(() => {
        // ✅ Only auto-slide if not hovered and more than one news item
        if (!isHovered && news.length > 1) {
            const interval = setInterval(() => {
                setCurrentIndex((prevIndex) => (prevIndex + 1) % news.length);
            }, 3000); // Change every 3 seconds
            return () => clearInterval(interval);
        }
    }, [news, isHovered]); // ✅ Added isHovered to pause/resume on hover

    if (loading) return <p className="text-center text-gray-400">Loading latest news...</p>;
    if (error) return <p className="text-center text-red-500">{error}</p>;
    if (!news.length) return <p>No news available.</p>;

    return (
        <div
            className="relative mt-6 mb-12 rounded-xl overflow-hidden"
            onMouseEnter={() => setIsHovered(true)} // ✅ Pause on hover
            onMouseLeave={() => setIsHovered(false)} // ✅ Resume on hover out
        >
            <div className="aspect-[21/9] relative bg-purple-800">
                {/* <img
          src="/images/interstellar_movie-wide.jpg?height=600&width=1400"
          alt="Featured movie"
          className="w-full h-full object-cover"
        /> */}
                <img
                    src={news[currentIndex].image}
                    alt={news[currentIndex].title}
                    className="w-full h-full object-cover rounded-md"
                />

                <div className="absolute inset-0 bg-gradient-to-r from-purple-900/80 to-transparent" />

                {/* ✅ Sliding News Content */}
                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentIndex}
                        initial={{ x: "100%", opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        exit={{ x: "-100%", opacity: 0 }}
                        transition={{ duration: 0.6 }}
                        className="absolute bottom-0 left-0 p-8 max-w-lg"
                    >
                        <h1 className="text-3xl font-bold mb-2">{news[currentIndex].title}</h1>
                        <h2 className="text-xl font-medium mb-2">{news[currentIndex].subtitle}</h2>
                        <p className="text-purple-200 mb-4">{news[currentIndex].description}</p>
                        <p className="text-sm text-purple-300">
                            By {news[currentIndex].author} |{" "}
                            {new Date(news[currentIndex].createdAt).toLocaleDateString()}
                        </p>
                    </motion.div>
                </AnimatePresence>
            </div>
        </div>
    );
};

export default NewsList;
