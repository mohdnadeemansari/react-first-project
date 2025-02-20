import React, { useEffect, useState } from "react";

export default function Home() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState("WordPress Posts");
  const [totalTags, setTotalTags] = useState({});

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
    // Fetch All Posts
    const fetchPosts = async () => {
      try {
        const response = await fetch(
          "https://inc42.com/wp-json/wp/v2/posts?per_page=100"
        );
        const data = await response.json();
        setPosts(data);

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

        setTotalTags(tagCount);
      } catch (error) {
        console.error("Error fetching posts:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <h1>{title}</h1>
      <p>Total Posts: {posts.length}</p>

      {/* Total Tags Section */}
      <h2>Total Tags Used:</h2>
      <ul>
        {Object.entries(totalTags).map(([tag, count]) => (
          <li key={tag}>
            {tag.toUpperCase()}: {count}
          </li>
        ))}
      </ul>

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
    </div>
  );
}
