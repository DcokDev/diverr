demo: https://dcokdev.github.io/diverr/

diverr is an environment where different people can register, just by giving a name, with this, they can create posts offering services, in addition to categorize them so that anyone can hire them, and to hire someone, you must pay the amount indicated, and send a message containing the specifications of the service, plus a means of contact to continue the process.

For those who want to pay to have a job done, they can search for posts by category, and those who want to sell their services, just make the post, and can see who has hired them, by entering the list of messages and read what they need, and their contact information.


In turn, users who have already hired a service can rate the service with stars, so that anyone, later, can see the other reviews, and know a little better the quality of the service.

## Methods

getMessage: Returns the data about a message, the sender, the content, the contact and the postId. By refering the message index.

getMessages: Returns an array of indexes of the messages that a service post has recieved.

getPost: Returns all the data of the Post referencedby his index.

getPostsLength: Returns amount of post created

getUser: Returns all the data of a user by his address

hireService: Transacts the money from the person who wants the service an the other who created the post, also, adds the message for the one who created the post to see it, and adds the address of the buyer to the post list of buyers, and finaly, verifies that the one who is hiring isnt the same who created the service post.

postService: Adds the post to the map of lists

registerUser: Registers the user, and let him/her to create service posts.

reviewService: Sends the review info, and adds it to the post info, also, verifies that the user who is reviewing, isnt the same that created the service post.

# Install

```

npm install

```

or 

```

yarn install

```

# Start

```

npm run dev

```

# Build

```

npm run build

```
# Usage
1. Install the [CeloExtensionWallet](https://chrome.google.com/webstore/detail/celoextensionwallet/kkilomkmpmkbdnfelcpgckmpcaemjcdh?hl=en) from the google chrome store.
2. Create a wallet.
3. Go to [https://celo.org/developers/faucet](https://celo.org/developers/faucet) and get tokens for the alfajores testnet.
4. Switch to the alfajores testnet in the CeloExtensionWallet.
