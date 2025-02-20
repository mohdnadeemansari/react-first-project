import React, { useEffect, useState } from "react";

export default function Home() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState("WordPress Posts");
  const [totalTags, setTotalTags] = useState({});
  const [totalPages, setTotalPages] = useState(0);
  const [totalPosts, setTotalPosts] = useState(0); // Total Posts Count
  const [remainingPosts, setRemainingPosts] = useState(0); // Remaining Posts Count
  const [currentPage, setCurrentPage] = useState(1);
  const perPage = 100; // Posts per page

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
    // Fetch Posts and Count Tags
    const fetchPosts = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          `https://inc42.com/wp-json/wp/v2/posts?per_page=${perPage}&page=${currentPage}`
        );

        const totalCount = response.headers.get("X-WP-Total"); // Total Posts Count
        const totalPostsCount = totalCount ? parseInt(totalCount) : 0;
        setTotalPosts(totalPostsCount); // Store total post count
        setRemainingPosts(totalPostsCount - posts.length); // Initial Remaining Posts

        const totalPagesCount = Math.ceil(totalPostsCount / perPage); // Total Pages
        setTotalPages(totalPagesCount);

        const data = await response.json();
        setPosts((prevPosts) => [...prevPosts, ...data]); // Append new posts
        setRemainingPosts((prevRemaining) => prevRemaining - data.length); // Decrease Remaining Posts

        // Count Only Used HTML Tags
        let tagCount = {};
        data.forEach((post) => {
          const tempDiv = document.createElement("div");
          tempDiv.innerHTML = post.content.rendered; // Parse HTML from content

          // List of tags to check
          const tagsToCheck = ["h1", "h2", "h3", "h4", "h5", "h6", "p", "ul", "li", "strong", "em"];
          tagsToCheck.forEach((tag) => {
            const count = tempDiv.getElementsByTagName(tag).length;
            if (count > 0) {
              tagCount[tag] = (tagCount[tag] || 0) + count; // Only store non-zero tags
            }
          });
        });

        setTotalTags((prevTags) => {
          let updatedTags = { ...prevTags };
          Object.entries(tagCount).forEach(([tag, count]) => {
            updatedTags[tag] = (updatedTags[tag] || 0) + count;
          });
          return updatedTags;
        });
      } catch (error) {
        console.error("Error fetching posts:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, [currentPage]); // Runs when `currentPage` changes

  return (
    <div>
      <h1>{title}</h1>
      <p>Total Posts: {totalPosts}</p>
      <p>Remaining Posts: {remainingPosts}</p>

      {/* Total Tags Section */}
      <h2>Total Tags Used:</h2>
      <ul>
        {Object.entries(totalTags).map(([tag, count]) => (
          <li key={tag}>
            {tag.toUpperCase()}: {count}
          </li>
        ))}
      </ul>

      {/* Posts List */}
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
      {currentPage < totalPages && (
        <button onClick={() => setCurrentPage((prev) => prev + 1)}>
          Load More (Remaining: {remainingPosts})
        </button>
      )}
    </div>
  );
}
