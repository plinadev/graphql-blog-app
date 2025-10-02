import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { gql } from "@apollo/client";
import { Button, Form } from "react-bootstrap";
import { useMutation } from "@apollo/client/react";

const SIGNIN = gql`
  mutation ($password: String, $email: String) {
    signin(credentials: { password: $password, email: $email }) {
      userErrors {
        message
      }
      token
    }
  }
`;
export default function Signin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [signin, { data }] = useMutation(SIGNIN);
  const handleClick = () => {
    signin({
      variables: {
        password,
        email,
      },
    });
  };

  const [error, setError] = useState(null);

  useEffect(() => {
    if (data) {
      if (data.signin.userErrors.length) {
        setError(data.signin.userErrors[0].message);
      }
      if (data.signin.token) {
        localStorage.setItem("token", data.signin.token);
        navigate("/posts");
      }
    }
  }, [data, navigate]);
  return (
    <div>
      <Form>
        <Form.Group className="mb-3">
          <Form.Label>Email</Form.Label>
          <Form.Control
            type="text"
            placeholder=""
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </Form.Group>
        <Form.Group className="mb-3">
          <Form.Label>Password</Form.Label>
          <Form.Control
            type="password"
            placeholder=""
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </Form.Group>

        {error && <p>{error}</p>}
        <Button onClick={handleClick}>Signin</Button>
      </Form>
    </div>
  );
}
