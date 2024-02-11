import Channel from "../models/channel.js";
import Message from "../models/message.js";
import User from "../models/user.js";

class Repository {
  DUPLICATE_KEY_ERROR_CODE = 11000;
  SYSTEM_AUTHOR = "System";
  COMMAND_RESULT_SUCCESS = "success";
  COMMAND_RESULT_ERROR = "error";

  /**
   * Add a new user to the database. The username is the same used for all the channels of a server and can be picked
   * up only once.
   */
  async login(username) {
    if (!username) {
      return new Message({
        text: `No username provided.`,
        author: this.SYSTEM_AUTHOR,
        date: Date.now(),
        commandResult: this.COMMAND_RESULT_ERROR,
      });
    }
    const user = new User({
      username: username,
    });
    return await user
      .save()
      .then(() => {
        return new Message({
          text: `User ${user.username} successfully created.`,
          author: this.SYSTEM_AUTHOR,
          date: Date.now(),
          commandResult: this.COMMAND_RESULT_SUCCESS,
        });
      })
      .catch((error) => {
        if (error.code === this.DUPLICATE_KEY_ERROR_CODE) {
          return new Message({
            text: "A user with this name already exists.",
            author: this.SYSTEM_AUTHOR,
            date: Date.now(),
            commandResult: this.COMMAND_RESULT_ERROR,
          });
        }
        return new Message({
          text: "An error occurred.",
          author: this.SYSTEM_AUTHOR,
          date: Date.now(),
          commandResult: this.COMMAND_RESULT_ERROR,
        });
      });
  }

  /**
   * Remove the user from the server database. After a logout, the username becomes available again for login.
   * @param username
   * @returns {Promise<Message>}
   */
  async logout(username) {
    if (!username) {
      return new Message({
        text: `No username provided.`,
        author: this.SYSTEM_AUTHOR,
        date: Date.now(),
        commandResult: this.COMMAND_RESULT_ERROR,
      });
    }
    return await User.findOne({ username: username }).then((user) => {
      if (!user) {
        return new Message({
          text: `User ${username} does not exist.`,
          author: this.SYSTEM_AUTHOR,
          date: Date.now(),
          commandResult: this.COMMAND_RESULT_ERROR,
        });
      }
      return User.deleteOne({ username: username }).then(() => {
        return new Message({
          text: `User ${username} successfully removed.`,
          author: this.SYSTEM_AUTHOR,
          date: Date.now(),
          commandResult: this.COMMAND_RESULT_SUCCESS,
        });
      });
    });
  }

  /**
   * Rename the user with if oldUsername is affected, and newUsername is not.
   * @param oldUsername
   * @param newUsername
   * @returns {Promise<Message>}
   */
  async renameUser(oldUsername, newUsername) {
    if (!oldUsername || !newUsername) {
      return new Message({
        text: `No new or old username provided.`,
        author: this.SYSTEM_AUTHOR,
        date: Date.now(),
        commandResult: this.COMMAND_RESULT_ERROR,
      });
    }
    User.findOne({ username: oldUsername }).then((user) => {
      if (!user) {
        return new Message({
          text: `No user of name ${oldUsername}.`,
          author: this.SYSTEM_AUTHOR,
          date: Date.now(),
          commandResult: this.COMMAND_RESULT_ERROR,
        });
      }
      return User.updateOne({ _id: user._id }, { username: newUsername })
        .then(() => {
          return new Message({
            text: `User successfully renamed.`,
            author: this.SYSTEM_AUTHOR,
            date: Date.now(),
            commandResult: this.COMMAND_RESULT_SUCCESS,
          });
        })
        .catch((error) => {
          if (error.code === this.DUPLICATE_KEY_ERROR_CODE) {
            return new Message({
              text: `A user with ${newUsername} already exists.`,
              author: this.SYSTEM_AUTHOR,
              date: Date.now(),
              commandResult: this.COMMAND_RESULT_ERROR,
            });
          }
        });
    });
  }

  /**
   * return all the channels of the server
   * @returns {Promise<Array<Channel>>}
   */
  async getChannels() {
    return await Channel.find()
      .then((channels) => {
        return channels;
      })
      .catch(() => {
        return [];
      });
  }

  /**
   * Return the channel matching the given name, if it exists
   * @param name
   * @returns {Promise<Channel|Message>}
   */
  async getChannelByName(name) {
    if (!name) {
      return new Message({
        text: `No channel name provided.`,
        author: this.SYSTEM_AUTHOR,
        date: Date.now(),
        commandResult: this.COMMAND_RESULT_ERROR,
      });
    }
    return await Channel.findOne({ name: name })
      .then((channel) => {
        return channel;
      })
      .catch((error) => {
        return new Message({
          text: "An error occurred.",
          author: this.SYSTEM_AUTHOR,
          date: Date.now(),
          commandResult: this.COMMAND_RESULT_ERROR,
        });
      });
  }

  /**
   * Return a list of the channels the user has subscribed to.
   * @param username
   * @returns {Promise<[Channel]|Message>}
   */
  async getUserSubscribedChannels(username) {
    if (!username) {
      return new Message({
        text: `No username provided.`,
        author: this.SYSTEM_AUTHOR,
        date: Date.now(),
        commandResult: this.COMMAND_RESULT_ERROR,
      });
    }
    return await Channel.find({ users: username }).catch((error) => {
      return new Message({
        text: "An error occurred.",
        author: this.SYSTEM_AUTHOR,
        date: Date.now(),
        commandResult: this.COMMAND_RESULT_ERROR,
      });
    });
  }

  /**
   * add a channel if no channel already exist in the database
   * @param name
   * @param author
   * @returns {Promise<Message>}
   */
  async addChannel(name, author) {
    if (!name || !author) {
      return new Message({
        text: `No name or author provided.`,
        author: this.SYSTEM_AUTHOR,
        date: Date.now(),
        commandResult: this.COMMAND_RESULT_ERROR,
      });
    }
    const channel = new Channel({
      name: name,
      author: author,
      users: [author],
    });
    return await channel
      .save()
      .then(() => {
        return new Message({
          text: `Channel ${channel.name} successfully created.`,
          author: this.SYSTEM_AUTHOR,
          date: Date.now(),
          commandResult: this.COMMAND_RESULT_SUCCESS,
        });
      })
      .catch((error) => {
        if (error.code === this.DUPLICATE_KEY_ERROR_CODE) {
          return new Message({
            text: `A channel with name ${name} already exists.`,
            author: this.SYSTEM_AUTHOR,
            date: Date.now(),
            commandResult: this.COMMAND_RESULT_ERROR,
          });
        }
        return new Message({
          text: "An error occurred.",
          author: this.SYSTEM_AUTHOR,
          date: Date.now(),
          commandResult: this.COMMAND_RESULT_ERROR,
        });
      });
  }

  /**
   * Rename the channel if oldchannelName is affected and newChannelName is not.
   * @param oldChannelName
   * @param newChannelName
   * @returns {Promise<Message>}
   */
  async renameChannel(oldChannelName, newChannelName) {
    if (!oldChannelName || !newChannelName) {
      return new Message({
        text: `No oldChannelName or newChannelName provided.`,
        author: this.SYSTEM_AUTHOR,
        date: Date.now(),
        commandResult: this.COMMAND_RESULT_ERROR,
      });
    }
    return await Channel.findOne({ name: oldChannelName }).then((channel) => {
      if (!channel) {
        return new Message({
          text: `No channel of name ${oldChannelName}.`,
          author: this.SYSTEM_AUTHOR,
          date: Date.now(),
          commandResult: this.COMMAND_RESULT_ERROR,
        });
      }
      return Channel.updateOne({ _id: channel._id }, { name: newChannelName })
        .then(() => {
          return new Message({
            text: `Channel successfully renamed.`,
            author: this.SYSTEM_AUTHOR,
            date: Date.now(),
            commandResult: this.COMMAND_RESULT_SUCCESS,
          });
        })
        .catch((error) => {
          return new Message({
            text: "An error occurred.",
            author: this.SYSTEM_AUTHOR,
            date: Date.now(),
            commandResult: this.COMMAND_RESULT_ERROR,
          });
        });
    });
  }

  /**
   * add a logged-in user to the given channel
   * @param channelName
   * @param username
   * @returns {Promise<Message>}
   */
  async addUserToChannel(channelName, username) {
    if (!channelName || !username) {
      return new Message({
        text: `No channelName or username provided.`,
        author: this.SYSTEM_AUTHOR,
        date: Date.now(),
        commandResult: this.COMMAND_RESULT_ERROR,
      });
    }
    const channel = await Channel.findOne({ name: channelName });
    const user = await User.findOne({ username: username });
    if (!channel) {
      return new Message({
        text: `No channel of name ${channelName}.`,
        author: this.SYSTEM_AUTHOR,
        date: Date.now(),
        commandResult: this.COMMAND_RESULT_ERROR,
      });
    }
    if (!user) {
      return new Message({
        text: `No user of name ${username}.`,
        author: this.SYSTEM_AUTHOR,
        date: Date.now(),
        commandResult: this.COMMAND_RESULT_ERROR,
      });
    }
    if (channel.users.includes(user.username)) {
      return new Message({
        text: `The user ${username} is already in the channel ${channelName}.`,
        author: this.SYSTEM_AUTHOR,
        date: Date.now(),
        commandResult: this.COMMAND_RESULT_ERROR,
      });
    }

    let users = channel.users;
    users.push(username);
    return Channel.updateOne({ _id: channel._id }, { users: users })
      .then(() => {
        return new Message({
          text: `User ${username} successfully added to the channel ${channelName}.`,
          author: this.SYSTEM_AUTHOR,
          date: Date.now(),
          commandResult: this.COMMAND_RESULT_SUCCESS,
        });
      })
      .catch((error) => {
        return new Message({
          text: "An error occurred.",
          author: this.SYSTEM_AUTHOR,
          date: Date.now(),
          commandResult: this.COMMAND_RESULT_ERROR,
        });
      });
  }

  /**
   * remove a logged-in user to the given channel
   * @param channelName
   * @param username
   * @returns {Promise<Message>}
   */
  async removeUserFromChannel(channelName, username) {
    if (!channelName || !username) {
      return new Message({
        text: `No channelName or username provided.`,
        author: this.SYSTEM_AUTHOR,
        date: Date.now(),
        commandResult: this.COMMAND_RESULT_ERROR,
      });
    }
    const channel = await Channel.findOne({ name: channelName });
    const user = await User.findOne({ username: username });
    if (!channel) {
      return new Message({
        text: `No channel of name ${channelName}.`,
        author: this.SYSTEM_AUTHOR,
        date: Date.now(),
        commandResult: this.COMMAND_RESULT_ERROR,
      });
    }
    if (!user) {
      return new Message({
        text: `No user of name ${username}.`,
        author: this.SYSTEM_AUTHOR,
        date: Date.now(),
        commandResult: this.COMMAND_RESULT_ERROR,
      });
    }
    if (!channel.users.includes(user.username)) {
      return new Message({
        text: `The user ${username} is not in the channel ${channelName}.`,
        author: this.SYSTEM_AUTHOR,
        date: Date.now(),
        commandResult: this.COMMAND_RESULT_ERROR,
      });
    }

    let users = channel.users;
    const index = users.indexOf(username);
    users.splice(index, 1);
    return Channel.updateOne({ _id: channel._id }, { users: users })
      .then(() => {
        return new Message({
          text: `User ${username} successfully removed from the channel ${channelName}.`,
          author: this.SYSTEM_AUTHOR,
          date: Date.now(),
          commandResult: this.COMMAND_RESULT_SUCCESS,
        });
      })
      .catch((error) => {
        return new Message({
          text: "An error occurred.",
          author: this.SYSTEM_AUTHOR,
          date: Date.now(),
          commandResult: this.COMMAND_RESULT_ERROR,
        });
      });
  }

  /**
   * remove the selected channel if it exists.
   * @param channelName
   * @returns {Promise<Message>}
   */
  async deleteChannel(channelName) {
    if (!channelName) {
      return new Message({
        text: `No channel name provided.`,
        author: this.SYSTEM_AUTHOR,
        date: Date.now(),
        commandResult: this.COMMAND_RESULT_ERROR,
      });
    }
    return await Channel.findOne({ name: channelName }).then(
      async (channel) => {
        if (!channel) {
          return new Message({
            text: `Channel ${channelName} does not exist.`,
            author: this.SYSTEM_AUTHOR,
            date: Date.now(),
            commandResult: this.COMMAND_RESULT_ERROR,
          });
        }
        await Message.deleteMany({ channelName: channelName });
        return Channel.deleteOne({ name: channelName }).then(() => {
          return new Message({
            text: `Channel ${channelName} successfully deleted.`,
            author: this.SYSTEM_AUTHOR,
            date: Date.now(),
            commandResult: this.COMMAND_RESULT_SUCCESS,
          });
        });
      }
    );
  }

  /**
   * Get all the given channel messages, if it exists
   * @param channelName
   * @returns {Promise<Array<Message>|Message>}
   */
  async getMessagesByChannel(channelName) {
    return await Channel.findOne({ name: channelName }).then((channel) => {
      // console.log(channel);
      if (!channel) {
        return new Message({
          text: `Channel ${channelName} does not exist.`,
          author: this.SYSTEM_AUTHOR,
          date: Date.now(),
          commandResult: this.COMMAND_RESULT_ERROR,
        });
      }
      return Message.find({ channelName: channelName })
        .then((channels) => {
          return channels;
        })
        .catch((error) => {
          return new Message({
            text: "An error occurred.",
            author: this.SYSTEM_AUTHOR,
            date: Date.now(),
            commandResult: this.COMMAND_RESULT_ERROR,
          });
        });
    });
  }

  /**
   * add a message to the given channel
   * @param text
   * @param author
   * @param channelName
   * @param [recipient]
   * @returns {Promise<Message>}
   */
  async addMessage(author, text, channelName, recipient) {
    return await Channel.findOne({ name: channelName }).then((channel) => {
      if (!channel) {
        return new Message({
          text: `Channel ${channelName} does not exist.`,
          author: this.SYSTEM_AUTHOR,
          date: Date.now(),
          commandResult: this.COMMAND_RESULT_ERROR,
        });
      }
      let message = new Message({
        author: author,
        text: text,
        date: Date.now(),
        channelName: channelName,
        recipient: recipient,
      });
      message.save().catch((error) => console.log(error));
    });
  }
}

export default Repository;
