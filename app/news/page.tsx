"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Clock,
  ExternalLink,
  ChevronRight,
  ChevronLeft,
  Newspaper,
  AlertCircle,
  Search,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { FloatingPaper } from "@/components/floating-paper";
import Navbar from "@/components/navbar";

// Define types for the news API response
interface NewsArticle {
  source: {
    id: string | null;
    name: string;
  };
  author: string | null;
  title: string;
  description: string | null;
  url: string;
  urlToImage: string | null;
  publishedAt: string;
  content: string | null;
}

interface NewsApiResponse {
  status: string;
  totalResults: number;
  articles: NewsArticle[];
}

export default function NewsPage() {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [news, setNews] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredNews, setFilteredNews] = useState<NewsArticle[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const articlesPerPage = 6;

  useEffect(() => {
    // Check if user is logged in
    const userId = localStorage.getItem("userId");
    if (userId) {
      setIsLoggedIn(true);
    }

    fetchSportsNews();
  }, []);

  useEffect(() => {
    // Filter news based on search query
    if (searchQuery.trim() === "") {
      setFilteredNews(news);
    } else {
      const filtered = news.filter(
        (article) =>
          article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (article.description &&
            article.description
              .toLowerCase()
              .includes(searchQuery.toLowerCase()))
      );
      setFilteredNews(filtered);
    }
    // Reset to first page when search changes
    setCurrentPage(1);
  }, [searchQuery, news]);

  const fetchSportsNews = async () => {
    try {
      setLoading(true);
      const response = await fetch("http://localhost:8080/api/news/sports");

      if (!response.ok) {
        throw new Error("Failed to fetch sports news");
      }

      const data: NewsApiResponse = await response.json();

      if (data.status === "ok") {
        setNews(data.articles);
        setFilteredNews(data.articles);
      } else {
        throw new Error("News API returned an error");
      }
    } catch (err) {
      console.error("Error fetching sports news:", err);
      setError("Failed to load sports news. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Pagination logic
  const indexOfLastArticle = currentPage * articlesPerPage;
  const indexOfFirstArticle = indexOfLastArticle - articlesPerPage;
  const currentArticles = filteredNews.slice(
    indexOfFirstArticle,
    indexOfLastArticle
  );
  const totalPages = Math.ceil(filteredNews.length / articlesPerPage);

  const nextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const prevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5,
      },
    },
  };

  return (
    <div className="min-h-screen bg-gray-50 antialiased bg-grid-blue/[0.02]">
      {/* Floating papers background */}
      <div className="absolute inset-0 overflow-hidden z-0">
        <FloatingPaper count={6} />
      </div>

      <Navbar isLoggedIn={isLoggedIn} setIsLoggedIn={setIsLoggedIn} />

      <div className="container mx-auto px-4 py-12 relative z-10">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-4xl md:text-5xl font-bold text-gray-900 mb-4"
          >
            Sports News
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-xl text-gray-600 max-w-3xl mx-auto"
          >
            Stay updated with the latest sports news from around the world
          </motion.p>
        </div>

        {/* Search Bar */}
        <div className="max-w-md mx-auto mb-12">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <Input
              type="text"
              placeholder="Search news..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 py-6 border-gray-300 rounded-lg"
            />
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <Alert
            variant="destructive"
            className="mb-6 bg-red-50 border-red-200 text-red-800"
          >
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* News Articles */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {Array(6)
              .fill(0)
              .map((_, index) => (
                <Card
                  key={index}
                  className="bg-white shadow-md overflow-hidden"
                >
                  <div className="aspect-video w-full">
                    <Skeleton className="h-full w-full" />
                  </div>
                  <CardHeader>
                    <Skeleton className="h-6 w-3/4 mb-2" />
                    <Skeleton className="h-4 w-full" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-4 w-full mb-2" />
                    <Skeleton className="h-4 w-full mb-2" />
                    <Skeleton className="h-4 w-3/4" />
                  </CardContent>
                  <CardFooter>
                    <Skeleton className="h-4 w-1/2" />
                  </CardFooter>
                </Card>
              ))}
          </div>
        ) : filteredNews.length === 0 ? (
          <div className="text-center py-12">
            <Newspaper className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              No news articles found
            </h3>
            <p className="text-gray-500">
              {searchQuery
                ? `No results found for "${searchQuery}". Try a different search term.`
                : "There are no sports news articles available at the moment."}
            </p>
          </div>
        ) : (
          <motion.div
            initial="hidden"
            animate="visible"
            variants={containerVariants}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {currentArticles.map((article, index) => (
              <motion.div
                key={`${article.title}-${index}`}
                variants={itemVariants}
              >
                <Card className="bg-white shadow-md hover:shadow-lg transition-shadow h-full flex flex-col">
                  {article.urlToImage ? (
                    <div className="aspect-video w-full overflow-hidden">
                      <img
                        src={article.urlToImage || "/placeholder.svg"}
                        alt={article.title}
                        className="w-full h-full object-cover transition-transform hover:scale-105"
                      />
                    </div>
                  ) : (
                    <div className="aspect-video w-full bg-gray-200 flex items-center justify-center">
                      <Newspaper className="h-12 w-12 text-gray-400" />
                    </div>
                  )}
                  <CardHeader>
                    <div className="flex items-center justify-between mb-2">
                      <Badge variant="outline" className="text-xs">
                        {article.source.name || "Unknown Source"}
                      </Badge>
                      <div className="text-xs text-gray-500">
                        {formatDate(article.publishedAt)}
                      </div>
                    </div>
                    <CardTitle className="text-xl line-clamp-2">
                      {article.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="flex-grow">
                    <CardDescription className="line-clamp-3">
                      {article.description || "No description available."}
                    </CardDescription>
                  </CardContent>
                  <CardFooter className="flex justify-between items-center">
                    <div className="flex items-center text-gray-500 text-sm">
                      <Clock className="h-4 w-4 mr-1" />
                      {formatTime(article.publishedAt)}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-primary border-primary hover:bg-primary/10"
                      onClick={() => window.open(article.url, "_blank")}
                    >
                      Read More
                      <ExternalLink className="ml-2 h-3 w-3" />
                    </Button>
                  </CardFooter>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* Pagination */}
        {!loading && filteredNews.length > 0 && (
          <div className="flex justify-between items-center mt-12">
            <Button
              variant="outline"
              onClick={prevPage}
              disabled={currentPage === 1}
              className="flex items-center"
            >
              <ChevronLeft className="mr-2 h-4 w-4" />
              Previous
            </Button>
            <div className="text-gray-700">
              Page {currentPage} of {totalPages}
            </div>
            <Button
              variant="outline"
              onClick={nextPage}
              disabled={currentPage === totalPages}
              className="flex items-center"
            >
              Next
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        )}

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="bg-primary rounded-2xl p-8 md:p-12 text-white text-center mt-20"
        >
          <h2 className="text-3xl font-bold mb-4">Stay in the Game</h2>
          <p className="text-lg mb-8 max-w-2xl mx-auto">
            Join SportSync today to create and participate in sports events
            while staying updated with the latest news.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              onClick={() => router.push("/register")}
              className="bg-white text-primary hover:bg-gray-100 px-8 py-6 text-lg font-medium rounded-md"
            >
              Sign Up Now
              <ChevronRight className="ml-2 h-5 w-5" />
            </Button>
            <Button
              onClick={() => router.push("/events/participate")}
              variant="outline"
              className="bg-transparent border-white text-white hover:bg-white/10 px-8 py-6 text-lg font-medium rounded-md"
            >
              Explore Events
            </Button>
          </div>
        </motion.div>
      </div>

      {/* Footer */}
      <footer className="py-6 bg-gray-100 text-center text-gray-600 relative z-10">
        <p>© 2023 SportSync. All rights reserved.</p>
      </footer>
    </div>
  );
}
