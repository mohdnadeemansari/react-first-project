import React, { useEffect, useState } from "react";

export default function Home() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState("WordPress Posts"); // Default Title
  const [page, setPage] = useState(1); // Current Page Number
  const [hasMore, setHasMore] = useState(true); // Check if More Posts Exist

  useEffect(() => {
    // Fetch Site Title
    const fetchTitle = async () => {
      try {
        const response = await fetch("https://inc42.com/wp-json");
        const data = await response.json();
        setTitle(data.name);
      } catch (error) {
        console.error("Error fetching site title:", error);
      }
    };

    fetchTitle();
  }, []);

  useEffect(() => {
    // Fetch Posts (Pagination Included)
    const fetchPosts = async () => {
      try {
        const response = await fetch(
          `https://inc42.com/wp-json/wp/v2/posts?per_page=20&page=${page}`
        );
        const data = await response.json();

        if (data.length > 0) {
          if (page === 1) {
            setPosts(data); // First page overwrite
          } else {
            setPosts((prevPosts) => [...prevPosts, ...data]); // Append new posts
          }
        } else {
          setHasMore(false); // No More Posts Available
        }
      } catch (error) {
        console.error("Error fetching posts:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, [page]); // Runs on page change

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <h1>{title}</h1> {/* Dynamic Site Title */}
      <ul>
        {posts.map((post) => (
          <li key={post.id}>
            <h2 dangerouslySetInnerHTML={{ __html: post.title.rendered }} />
            <a href={post.link} target="_blank" rel="noopener noreferrer">
              Read More
            </a>
          </li>
        ))}
      </ul>

      {/* Load More Button */}
      {hasMore && (
        <button onClick={() => setPage(page + 1)}>Load More</button>
      )}
    </div>
  );
}
