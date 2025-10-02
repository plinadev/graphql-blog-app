import React from "react";
import Post from "../../components/Post/Post";
import { gql } from "@apollo/client";
import { useQuery } from "@apollo/client/react";

const GET_POSTS = gql`
  query {
    posts {
      id
      title
      content
      createdAt
      published
      user {
        name
      }
    }
  }
`;

export default function Posts() {
  const { data, error, loading } = useQuery(GET_POSTS);
  if (error) return <div>An error occured</div>;

  if (loading) return <div>Loading posts...</div>;
  const { posts } = data;
  return (
    <div>
      {posts.map((post) => (
        <Post
          key={post.id}
          id={post.id}
          title={post.title}
          date={post.createdAt}
          content={post.content}
          user={post.user.name}
          published={post.published}
        />
      ))}
    </div>
  );
}
