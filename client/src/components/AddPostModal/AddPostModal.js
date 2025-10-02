import { gql } from "@apollo/client";
import { useMutation } from "@apollo/client/react";
import React, { useEffect, useState } from "react";
import { Modal, Button, Form } from "react-bootstrap";

const CREATE_POST = gql`
  mutation ($title: String!, $content: String!) {
    postCreate(post: { title: $title, content: $content }) {
      userErrors {
        message
      }
      post {
        id
        title
        content
      }
    }
  }
`;
export default function AddPostModal() {
  const [show, setShow] = useState(false);

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  const [content, setContent] = useState("");
  const [title, setTitle] = useState("");
  const [createPost, { data }] = useMutation(CREATE_POST);
  const [mutationError, setError] = useState(null);
  const handleClick = () => {
    if (!content || !title) return;
    createPost({
      variables: {
        title,
        content,
      },
    });
    handleClose();
  };

  useEffect(() => {
    if (data) {
      if (data.postCreate.userErrors.length) {
        setError(data.postCreate.userErrors[0].message);
      }
    }
  }, [data]);

  return (
    <>
      <Button variant="primary" onClick={handleShow}>
        Add Post
      </Button>

      <Modal
        show={show}
        onHide={handleClose}
        backdrop="static"
        keyboard={false}
      >
        <Modal.Header closeButton>
          <Modal.Title>Add Post</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3" controlId="formBasicEmail">
              <Form.Label>Title</Form.Label>
              <Form.Control
                type="text"
                placeholder=""
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </Form.Group>

            <Form.Group
              className="mb-3"
              controlId="exampleForm.ControlTextarea1"
            >
              <Form.Label>Content</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={content}
                onChange={(e) => setContent(e.target.value)}
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>
            Close
          </Button>
          <Button variant="primary" onClick={handleClick}>
            Add
          </Button>
          {mutationError && <p>{mutationError}</p>}
        </Modal.Footer>
      </Modal>
    </>
  );
}
