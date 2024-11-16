## Clasp Login with Remote Host Port Forwarding

While `clasp login` theoretically supports the `--no-localhost` switch, I encountered a 400 error when trying to use it. Here's how to authenticate with a remote host:

1. Run `clasp login` in your terminal. You'll see a message like this:
    ```bash
    Authorize clasp by visiting this url:
    https://accounts.google.com/o/oauth2/v2/auth [cut] &redirect_uri=http%3A%2F%2Flocalhost%3A33065
    ```
1. Focus on the `redirect_uri`. This is a URL-encoded OAuth redirection URL (e.g., `http://localhost:33065`). After completing authentication, your browser will be redirected to this address. Clasp waits on this port for an HTTP connection. 
1. Extract the Port. You'll need the last five digits following the final colon (`:` or `%3A` urlencoded). In this example, that's `33065`.
1. Open a new terminal window and run the following `ssh` command, replacing placeholders with your information:
    ```bash
    ssh -L <port>:localhost:<port> username@remote.machine
    ```
1. Return to the first terminal window and follow the original authorization link in the message. Complete the Google authorization process.
1. After successful authorization, your browser will display a message like `Login completed. You can close the window`.
1. Close forwarding session.
