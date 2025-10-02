import React, { useEffect, useState } from "react";
import { useParams } from "react-router";
import AddPostModal from "../../components/AddPostModal/AddPostModal";
import Post from "../../components/Post/Post";
import { gql } from "@apollo/client";
import { useMutation, useQuery } from "@apollo/client/react";

const GET_PROFILE = gql`
  query GetProfile($userId: ID!) {
    profile(userId: $userId) {
      bio
      isMyProfile
      user {
        id
        name
        posts {
          id
          title
          content
          published
          createdAt
        }
      }
    }
  }
`;


export default function Profile() {
  const { id } = useParams();
  const { data, error, loading } = useQuery(GET_PROFILE, {
    variables: {
      userId: id,
    },
  });

  if (error) return <div>An error occured</div>;

  if (loading) return <div>Loading profile...</div>;
  const { profile } = data;

  return (
    <div>
      <div
        style={{
          marginBottom: "2rem",
          display: "flex ",
          justifyContent: "space-between",
        }}
      >
        <div>
          <h1>{profile.user.name}</h1>
          <p>{profile.bio}</p>
        </div>
        <div>{profile.isMyProfile ? <AddPostModal /> : null}</div>
      </div>
      <div>
        {profile.user.posts.map((post) => (
          <Post
            key={post.id}
            title={post.title}
            content={post.content}
            published={post.published}
            id={post.id}
            date={post.createdAt}
            user={profile.user.name}
            isMyProfile={profile.isMyProfile}
          />
        ))}
      </div>
    </div>
  );
}
