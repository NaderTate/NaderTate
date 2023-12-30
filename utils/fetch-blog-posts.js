import fs from "fs/promises"; // Use fs.promises for async file operations
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

// Example usage

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

const apiUrl = "https://nailed-it.tech/api/posts?limit=6";
const fetchPosts = async () => {
  try {
    const response = await fetch(apiUrl);
    const posts = await response.json();
    return posts;
  } catch (error) {
    console.error(error);
    throw new Error(error);
  }
};
async function generatePostCard(post) {
  const thumbnail = await fetchImage(
    `https://nailed-it.tech/articles/${post.slug.current}`
  );
  console.log({ thumbnail });
  return `<a href="https://nailed-it.tech/articles/${post.slug.current}" target="_blank"><img src="${thumbnail}" width="450" ></a>`;
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
      const newPostsContent = posts.map(await generatePostCard()).join("\n");
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

  // console.log(posts);
};
main();
