import React from "react";
import "./Post.css";
import { gql } from "@apollo/client";
import { useMutation } from "@apollo/client/react";

const PUBLISH_POST = gql`
  mutation ($postId: ID!) {
    postPublish(postId: $postId) {
      userErrors {
        message
      }
      post {
        id
        title
      }
    }
  }
`;

const UNPUBLISH_POST = gql`
  mutation ($postId: ID!) {
    postUnpublish(postId: $postId) {
      userErrors {
        message
      }
      post {
        id
        title
      }
    }
  }
`;
export default function Post({
  title,
  content,
  date,
  user,
  published,
  id,
  isMyProfile,
}) {
  const formatedDate = new Date(Number(date));
  const [publishPost, { data, loading, error }] = useMutation(PUBLISH_POST);
  const [unpublishPost] = useMutation(UNPUBLISH_POST);
  return (
    <div
      className="Post"
      style={published === false ? { backgroundColor: "hotpink" } : {}}
    >
      {isMyProfile && published === false && (
        <p
          className="Post__publish"
          onClick={() => {
            publishPost({
              variables: {
                postId: id,
              },
            });
          }}
        >
          publish
        </p>
      )}
      {isMyProfile && published === true && (
        <p
          className="Post__publish"
          onClick={() => {
            unpublishPost({
              variables: {
                postId: id,
              },
            });
          }}
        >
          unpublish
        </p>
      )}
      <div className="Post__header-container">
        <h2>{title}</h2>
        <h4>
          Created At {`${formatedDate}`.split(" ").splice(0, 3).join(" ")} by{" "}
          {user}
        </h4>
      </div>
      <p>{content}</p>
    </div>
  );
}
