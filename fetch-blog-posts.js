import fs from "fs/promises"; // Use fs.promises for async file operations

const apiUrl = "https://nailed-it.tech/api/posts";
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
function generatePostCard(post) {
  return `<a href="https://www.nailed-it.tech/articles/${post.slug.current}" target="_blank">
    <div style="position:relative;width:400px; overflow:hidden; margin:10px;">
      <img style="width:100%;border-radius:3px" src="${post.thumbnail}">
      <div style="border-radius:3px;position: absolute; bottom:5px; padding:5px; backdrop-filter: blur(10px); width:100%; background-color:rgba(0, 0, 0, 0.3); color:white">
        <span style="display:block;font-size:18px;font-weight:500;white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${post.title}</span>
        <span style="display:block;font-size:14;white-space: nowrap; overflow: hidden; text-overflow: ellipsis">${post.description}</span>
      </div>
    </div>
  </a>`;
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

  console.log(posts);
};
main();
