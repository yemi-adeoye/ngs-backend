-- ALTER TABLE users AUTO_INCREMENT = 1

CREATE database db_naija_gist_soccer;

DROP TABLE IF EXISTS users;

CREATE TABLE users (
  `id` int NOT NULL AUTO_INCREMENT,
  `firstName` varchar(255) NOT NULL,
  `lastName` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `phone` varchar(255) NOT NULL,
  `dob` date NOT NULL,
  `sex` tinyint(1) NOT NULL,
  `password` varchar(255) NOT NULL,
  `isActive` tinyint(1) DEFAULT '1',
  `isSuspended` tinyint(1) DEFAULT '0',
  `lastSuccessfulLogin` datetime DEFAULT NULL,
  `lastUnsuccessfulLogin` datetime DEFAULT NULL,
  `invalidLoginCount` smallint DEFAULT '0',
  `roles` json DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`),
  UNIQUE KEY `phone` (`phone`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

DROP TABLE IF EXISTS profiles;

CREATE TABLE `profiles` (
  `id` int NOT NULL AUTO_INCREMENT,
  `profilePic` varchar(255) DEFAULT 'https://localhost:7852/default.png',
  `club` varchar(255) DEFAULT '',
  `followersCount` bigint DEFAULT '0',
  `followingCount` bigint DEFAULT '0',
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  `userId` int NOT NULL,
  PRIMARY KEY (`id`),
  KEY `userId` (`userId`),
  CONSTRAINT `profiles_ibfk_1` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

DROP TABLE IF EXISTS posts;

CREATE TABLE posts (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `text` varchar(255) DEFAULT NULL,
  `likeCount` int DEFAULT '0',
  `madCount` int DEFAULT '0',
  `shockCount` int DEFAULT '0',
  `sharedPostId` int DEFAULT NULL,
  `isEdited` tinyint(1) DEFAULT '0',
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  `userId` int NOT NULL,
  PRIMARY KEY (`id`),
  KEY `userId` (`userId`),
  CONSTRAINT `posts_ibfk_1` FOREIGN KEY (`userId`) REFERENCES users (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

DROP TABLE IF EXISTS post_reactions;

CREATE TABLE post_reactions (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `reactionType` varchar(255) DEFAULT NULL,
  `userId` int NOT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  `postId` bigint NOT NULL,
  PRIMARY KEY (`id`),
  KEY `postId` (`postId`),
  CONSTRAINT `post_reactions_ibfk_1` FOREIGN KEY (`postId`) REFERENCES posts (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

DROP TABLE IF EXISTS post_media;

CREATE TABLE post_media (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `mediaUrl` json DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  `postId` bigint NOT NULL,
  PRIMARY KEY (`id`),
  KEY `postId` (`postId`),
  CONSTRAINT `post_media_ibfk_1` FOREIGN KEY (`postId`) REFERENCES posts (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

DROP TABLE IF EXISTS followings;

CREATE TABLE followings (
  `followFrom` int NOT NULL,
  `followTo` int NOT NULL,
  `createdAt` datetime NOT NULL,
  PRIMARY KEY (`followFrom`,`followTo`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

DROP TABLE IF EXISTS comments;

CREATE TABLE comments (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `text` varchar(255) DEFAULT NULL,
  `likeCount` int DEFAULT '0',
  `madCount` int DEFAULT '0',
  `shockCount` int DEFAULT '0',
  `isEdited` tinyint(1) DEFAULT '0',
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  `userId` int NOT NULL,
  `postId` bigint NOT NULL,
  PRIMARY KEY (`id`),
  KEY `userId` (`userId`),
  KEY `postId` (`postId`),
  CONSTRAINT `comments_ibfk_1` FOREIGN KEY (`userId`) REFERENCES users (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `comments_ibfk_2` FOREIGN KEY (`postId`) REFERENCES posts (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

DROP TABLE IF EXISTS comment_reactions;

CREATE TABLE comment_reactions (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `reactionType` varchar(255) DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  `commentId` bigint NOT NULL,
  `userId` int NOT NULL,
  PRIMARY KEY (`id`),
  KEY `commentId` (`commentId`),
  KEY `userId` (`userId`),
  CONSTRAINT `comment_reactions_ibfk_1` FOREIGN KEY (`commentId`) REFERENCES comments (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `comment_reactions_ibfk_2` FOREIGN KEY (`userId`) REFERENCES users (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

DROP TABLE IF EXISTS comment_media;

CREATE TABLE comment_media (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `mediaUrl` json DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  `commentId` bigint NOT NULL,
  PRIMARY KEY (`id`),
  KEY `commentId` (`commentId`),
  CONSTRAINT `comment_media_ibfk_1` FOREIGN KEY (`commentId`) REFERENCES comments (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

ALTER TABLE users AUTO_INCREMENT = 1