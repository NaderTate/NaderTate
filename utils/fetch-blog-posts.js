import fs from "fs/promises";
import { JSDOM } from "jsdom";

// Function to fetch HTML content from a URL
async function fetchHtml(url) {
  try {
    const response = await fetch(url);
    const html = await response.text();
    return html;
  } catch (error) {
    console.error("Error fetching HTML:", error);
  }
}

// Function to extract og:image from HTML content
function extractOGImage(html) {
  const dom = new JSDOM(html);
  const ogImage = dom.window.document.querySelector(
    'meta[property="og:image"]'
  );
  return ogImage ? ogImage.getAttribute("content") : null;
}

const fetchImage = async (url) => {
  try {
    const html = await fetchHtml(url);
    const ogImage = extractOGImage(html);
    if (ogImage) {
      return ogImage;
    } else {
      console.log("No og:image found on the page.");
    }
  } catch (error) {
    console.error(error);
    throw new Error(error);
  }
};
const fetchPosts = async () => {
  try {
    const response = await fetch("https://nailed-it.tech/api/posts?limit=6");
    let posts = await response.json();
    for (const post of posts) {
      const thumbnail = await fetchImage(
        `https://nailed-it.tech/articles/${post.slug.current}`
      );
      post.thumbnail = thumbnail;
    }
    return posts;
  } catch (error) {
    console.error(error);
    throw new Error(error);
  }
};

function generatePostCard(post) {
  const key = Math.random()*100
  return `<a key={${key}} href="https://nailed-it.tech/articles/${post.slug.current}" target="_blank"><img src="${post.thumbnail}" width="400" /></a>`;
}
async function generateReadme(posts) {
  try {
    // Read existing content of README file
    const existingContent = await fs.readFile("README.md", "utf-8");

    // Check if the comment tags exist in the README file
    const beginTag = "<!-- Begin posts section -->";
    const endTag = "<!-- End posts section -->";

    const beginTagIndex = existingContent.indexOf(beginTag);
    const endTagIndex = existingContent.indexOf(endTag);

    if (
      beginTagIndex !== -1 &&
      endTagIndex !== -1 &&
      beginTagIndex < endTagIndex
    ) {
      // Replace content between the comment tags with the new blog posts
      const beforePosts = existingContent.substring(
        0,
        beginTagIndex + beginTag.length
      );
      const afterPosts = existingContent.substring(endTagIndex);
      const newPostsContent = posts.map(generatePostCard).join("\n");
      const updatedContent = `${beforePosts}\n\n${newPostsContent}\n\n${afterPosts}`;

      // Write the updated content back to the README file
      await fs.writeFile("README.md", updatedContent, "utf-8");
      console.log("Blog posts section in README.md updated.");
    } else {
      console.warn(
        "Comment tags not found or not in the correct order. No changes made."
      );
    }
  } catch (error) {
    console.error("Error updating README.md:", error.message);
    throw error;
  }
}

const main = async () => {
  const posts = await fetchPosts();
  await generateReadme(posts);
};

main();
