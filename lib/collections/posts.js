Posts = new Mongo.Collection('posts');

validatePost = function (post) {

  var errors = {};

  if (!post.title) {
    errors.title = 'Please fill in a headline';
  }

  if (!post.url) {
    errors.url = 'Plase fill in a URL';
  }

  return errors;
};

Posts.allow({

  update: function (userId, post) {
    return ownsDocument(userId, post);
  },

  remove: function (userId, post) {
    return ownsDocument(userId, post);
  }

});

Posts.deny({

  update: function (userId, post, fieldNames) {

    // may only edit the following two fields
    return (_.without(fieldNames, 'url', 'title').length > 0);
  }

});

Posts.deny({

    update: function (userId, post, fieldNames, modifier) {

        var errors = validatePost(modifier.$set);

        return errors.title || errors.url;
    }

});

Meteor.methods({

  postInsert: function (postAttributes) {

    var user, post, postId, postWithSameLink, errors;

    check(this.userId, String);
    check(postAttributes, {
      title: String,
      url: String
    });

    errors = validatePost(postAttributes);

    if (errors.title || errors.url) {
      throw new Meteor.Error('invalid-post', 'You must set a title and URL for your post');
    }

    postWithSameLink = Posts.findOne({
      url: postAttributes.url
    });

    if (postWithSameLink) {
      return {
        postExists: true,
        _id: postWithSameLink._id
      };
    }

    user = Meteor.user();
    post = _.extend(postAttributes, {
      userId: user._id,
      author: user.username,
      submitted: new Date(),
      commentsCount: 0,
      upvoters: [],
      votes: 0
    });

    postId = Posts.insert(post);

    return {
      _id: postId
    };
  },

  upvote: function (postId) {

    check(this.userId, String);
    check(postId, String);

    var post = Posts.findOne(postId);

    if (!post) {
      throw new Meteor.Error('invalid', 'Post not found');
    }

    if (_.include(post.upvotes, this.userId)) {
      throw new Meteor.Error('invalid', 'Already upvoted this post');
    }

    Posts.update(post._id, {
      $addToSet: {
        upvoters: this.userId
      },
      $inc: {
        votes: 1
      }
    });

  }

});
