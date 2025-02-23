// src/components/Feed.tsx
import { useState, useEffect } from "react";
import usePosts from "@/hooks/usePosts";
import DefaultLayout from "@/layouts/default";

const Dashboard = () => {
    const {
        posts,
        loading,
        error,
        fetchPosts,
        createNewPost,
    } = usePosts();
    const [content, setContent] = useState<string>("");
    const [tags, setTags] = useState<string>("");

    useEffect(() => {
        fetchPosts();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const tagArray = tags ? tags.split(",").map(tag => tag.trim()) : [];
            await createNewPost({ content, tags: tagArray, isAnonymous: false });
            setContent("");
            setTags("");
        } catch (err) {
            console.error("Error creating post:", err);
        }
    };

    return (
        <DefaultLayout>
            <div style={{ maxWidth: 600, margin: "0 auto", padding: "1rem" }}>
                <h1>Feed</h1>
                <form onSubmit={handleSubmit} style={{ marginBottom: "1rem" }}>
                    <textarea
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        placeholder="What's on your mind?"
                        required
                        style={{ width: "100%", height: "100px", marginBottom: "0.5rem" }}
                    />
                    <input
                        type="text"
                        value={tags}
                        onChange={(e) => setTags(e.target.value)}
                        placeholder="Tags (comma separated)"
                        style={{ width: "100%", marginBottom: "0.5rem" }}
                    />
                    <button type="submit" disabled={loading}>
                        {loading ? "Posting..." : "Post"}
                    </button>
                </form>
                {error && <div style={{ color: "red", marginBottom: "1rem" }}>{error}</div>}
                <div>
                    {loading && posts.length === 0 ? (
                        <p>Loading posts...</p>
                    ) : posts.length > 0 ? (
                        posts.map((post: any) => (
                            <div
                                key={post.postID}
                                style={{
                                    border: "1px solid #ccc",
                                    borderRadius: "4px",
                                    padding: "0.5rem",
                                    marginBottom: "0.5rem",
                                }}
                            >
                                <p>{post.content}</p>
                                {post.tags && post.tags.length > 0 && (
                                    <p style={{ fontStyle: "italic" }}>
                                        Tags: {post.tags.join(", ")}
                                    </p>
                                )}
                            </div>
                        ))
                    ) : (
                        <p>No posts yet.</p>
                    )}
                </div>
            </div>
        </DefaultLayout>

    );
};

export default Dashboard;
