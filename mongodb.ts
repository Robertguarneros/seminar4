import { Schema, model, connect, connection } from 'mongoose';
import * as promptSync from 'prompt-sync';

// 1. Create an interface representing a document in MongoDB.
interface IUser {
  _id?: string; // Add this line to include _id field
  name: string;
  email: string;
  avatar?: string;
}

interface IPost {
    title: string;
    content: string;
    author: string; // Reference to the User collection
}

// 2. Create a Schema corresponding to the document interface.
const userSchema = new Schema<IUser>({
  name: { type: String, required: true },
  email: { type: String, required: true },
  avatar: String
});

const postSchema = new Schema<IPost>({
  title: { type: String, required: true },
  content: { type: String, required: true },
  author: { type: String, ref: 'User', required: true }
});

// 3. Create a Model.
const User = model<IUser>('User', userSchema);
const Post = model<IPost>('Post',postSchema);

async function createUser(name, email,avatar){
    const user = new User({
    name: name,
    email: email,
    avatar: avatar
    });
    await user.save();
}
async function createPost(title, content, id){
    const post1 = new Post({
        title: title,
        content: content,
        author:id
      });
      await post1.save();
}

async function findUsers(){
    //Read user list
    const users = await User.find();
    console.log(users);
}
async function findPostsFromUserByName(name: string){
    // Find the user by name
    const user = await User.findOne({ name: name });

    if (!user) {
        console.log('User not found');
        return;
    }

    // Read posts from the user found by name
    const postsFromSameUser = await Post.find({ author: user._id });
    console.log(postsFromSameUser);
}

async function updateUser(name, id){
    //Update
    const updatedUser = await User.updateOne(
    { _id: id },
    { name: name }
);
}

async function deleteUser(id){
const deletedUser = await User.findOneAndDelete({ _id: id });
if (deletedUser) {
  console.log('User deleted successfully');
} else {
  console.log('User not found or could not be deleted');
}
}
async function deletePost(id){
const deletedPost = await Post.findOneAndDelete({ _id: id });

if (deletedPost) {
  console.log('Post deleted successfully');
} else {
  console.log('Post not found or could not be deleted');
}
}
async function getPostsAndAuthors() {
    const posts = await Post.find().populate('author'); // Populate the 'author' field with user documents
    console.log(posts);
  }

async function run() {
    // 4. Connect to MongoDB
    await connect('mongodb://127.0.0.1:27017/test');
  
    //Create Users and Posts to work with
    const user = new User({
      name: 'Bill',
      email: 'bill@initech.com',
      avatar: 'https://i.imgur.com/dM7Thhn.png'
    });
    await user.save();
    const user2 = new User({
      name: 'Roberto',
      email: 'roberto@initech.com',
      avatar: 'https://i.imgur.com/dM7Thhn.png'
    });
    await user2.save();
  
    const post1 = new Post({
      title: 'First Post',
      content: 'Hello, this is my first post',
      author:user._id
    });
    await post1.save();
    const post2 = new Post({
      title: 'Second Post',
      content: 'Hello, this is my first post',
      author:user._id
    });
    await post2.save();
    //Test functions
    const prompt = promptSync();

    console.log('1. Create User');
    const name = prompt('Enter user name: ');
    const email = prompt('Enter user email: ');
    const avatar = prompt('Enter user avatar URL: ');
    await createUser(name, email, avatar);

    console.log('2. Create Post');
    const title = prompt('Enter title: ');
    const content = prompt('Enter content: ');
    const author = prompt('Enter author id: ');
    await createPost(title, content, author);

    console.log('3. Find Users');
    await findUsers();

    console.log('4. Find Posts from User');
    const username = prompt('Enter user name: ');
    await findPostsFromUserByName(username);

    console.log('5. Update User');
    const userIdToUpdate = prompt('Enter user _id to update: ');
    const nameToUpdate = prompt('Enter name to update: ');
    await updateUser(nameToUpdate, userIdToUpdate);

    console.log('6. Delete Post');
    const postIdToDelete = prompt('Enter post _id to delete: ');
    await deletePost(postIdToDelete);

    console.log('7. Delete User');
    const userIdToDelete = prompt('Enter user _id to delete: ');
    await deleteUser(userIdToDelete);

    getPostsAndAuthors().then(() => {connection.close(); });// Close the connection after operation completes
    console.log('Done!');

  }

run().catch(err => console.log(err));