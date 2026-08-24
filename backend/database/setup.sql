-- Create Database if not exists
CREATE DATABASE IF NOT EXISTS `kallakurichi_cdo` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `kallakurichi_cdo`;

-- 1. Admins Table
CREATE TABLE IF NOT EXISTS `admins` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `username` VARCHAR(100) UNIQUE NOT NULL,
  `password` VARCHAR(255) NOT NULL,
  `role` VARCHAR(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT IGNORE INTO `admins` (`id`, `username`, `password`, `role`) VALUES
(1, 'kavinselvaraj12@gmail.com', 'admin123', 'Super Admin'),
(2, 'rakesh_admin', 'password@123', 'Admin');

-- 2. MLA Data Table (Clean Admin Schema)
CREATE TABLE IF NOT EXISTS `mla_data` (
  `id` INT PRIMARY KEY,
  `name` VARCHAR(255) NOT NULL,
  `photo` LONGTEXT NOT NULL,
  `suffix` VARCHAR(255) NOT NULL,
  `constituency` VARCHAR(255) NOT NULL,
  `bio` TEXT NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT IGNORE INTO `mla_data` (`id`, `name`, `photo`, `suffix`, `constituency`, `bio`) VALUES
(1, 
 'Mr. C. Arul Vignesh', 
 '/arul_vignesh.png', 
 'M.Sc., MLA', 
 'Kallakurichi Constituency | Tamilaga Vettri Kazhagam', 
 'Mr. C. Arul Vignesh (born 1991) is an Indian politician from Tamil Nadu. He is a member of the Tamil Nadu Legislative Assembly from the Kallakurichi Assembly constituency, representing the Tamilaga Vettri Kazhagam.\n\nMr. C. Arul Vignesh hails from Kallakurichi, Tamil Nadu. He holds an M.Sc. degree in Life Sciences (2012) from Bharathidasan University. He is deeply committed to public service and the progressive development of his constituency.');

-- 3. Daily Updates Table
CREATE TABLE IF NOT EXISTS `daily_updates` (
  `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
  `title` VARCHAR(500) NOT NULL,
  `description` TEXT NOT NULL,
  `category` VARCHAR(100) NOT NULL,
  `location` VARCHAR(255) NOT NULL,
  `date` VARCHAR(100) NOT NULL,
  `image` LONGTEXT NOT NULL,
  `status` VARCHAR(50) DEFAULT 'DONE',
  `hasBadge` BOOLEAN DEFAULT TRUE,
  `isBefore` BOOLEAN DEFAULT FALSE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT IGNORE INTO `daily_updates` (`id`, `title`, `description`, `category`, `location`, `date`, `image`, `status`, `hasBadge`, `isBefore`) VALUES
(1, 'Garbage Clearance and Sanitation Improvement', 'Under the supervision of local ward authorities, massive garbage mounds at PP Garden were cleared, followed by complete disinfection and street sweeping.', 'WELLNESS', 'PP GARDEN - 102 WARD', 'Aug 12, 2026', '/completed_water_supply.jpg', 'PENDING', FALSE, TRUE),
(2, 'Swift Action Taken on Public Garbage Complaints.', 'Immediate response to citizens complaints regarding overflowing public waste bins. The entire zone along Bharathipuram Main Road was cleaned and cleared.', 'PARKS & WALKWAYS', 'BHARATHIPURAM MAIN ROAD', 'Aug 11, 2026', '/completed_streetlights.jpg', 'PENDING', FALSE, TRUE),
(3, 'Encroachments Removed from Revamped Anna Nagar Bougainvillea Park Under MLA Mr. Arul Vignesh Initiative', 'Under the active supervision of MLA Mr. Arul Vignesh, key encroachments surrounding the Bougainvillea Park in Anna Nagar were cleared by corporation officials, restoring pedestrian pathways.', 'PARKS & WALKWAYS', 'BOUGAINVILLEA PARK', 'Aug 10, 2026', '/completed_road_work.jpg', 'DONE', TRUE, FALSE),
(4, 'Grand re-opening of Bougainvillea Park', 'MLA Mr. Arul Vignesh along with community members inaugurated the fully renovated Bougainvillea Park, featuring new green lawns, clean walking tracks, and children play facilities.', 'ROADS', 'BOUGAINVILLEA PARK', 'Aug 09, 2026', '/header-banner02.png', 'DONE', TRUE, FALSE),
(5, 'Water Logging Cleared at Salem-Ulundurpet National Highway Junction', 'Emergency drainage deployment cleared severe water logging after heavy overnight rainfall, preventing long traffic congestion at the Kallakurichi entry highway.', 'ROADS', 'SALEM HIGHWAY', 'Aug 06, 2026', '/completed_road_work.jpg', 'PENDING', FALSE, TRUE),
(6, 'Heavy Rain Relief Materials Distributed in Sankarapuram Wards', 'Essential grocery kits, blankets, and milk supplies were distributed to over 300 families in low-lying Sankarapuram blocks following severe storm water accumulation.', 'WELLNESS', 'SANKARAPURAM', 'Aug 03, 2026', '/header-banner0d1.png', 'DONE', TRUE, FALSE),
(7, 'Pothole Filling & Road Restoration on Kachirayapalayam Main Road', 'Full restoration and filling of deep potholes along the high-traffic Kachirayapalayam road to guarantee rider safety and smooth local transit.', 'ROADS', 'KACHIRAYAPALAYAM RD', 'July 29, 2026', '/completed_road_work.jpg', 'DONE', TRUE, FALSE),
(8, 'High-Mast Solar Streetlights Installation Completed at Chinnasalem', 'Commissioned 15 high-power solar LED streetlights at key pedestrian junctions in Chinnasalem to increase night safety and visibility.', 'STREET LIGHTS', 'CHINNASALEM', 'July 23, 2026', '/completed_streetlights.jpg', 'DONE', TRUE, FALSE),
(9, 'New RO Clean Drinking Water Plant Opened at Thiyagadurgam Bus Stand', 'A free reverse osmosis water purification station was set up for public use, benefiting thousands of daily commuters and local shopkeepers.', 'WATER SUPPLY', 'THIYAGADURGAM', 'July 16, 2026', '/completed_water_supply.jpg', 'DONE', TRUE, FALSE),
(10, 'Mass Health and Eye Care Camp for Agricultural Laborers Coordinated', 'Specialist doctors conducted free health checks, distributed basic medicines, and supplied free reading glasses to agricultural workers in Kallakurichi outskirts.', 'WELLNESS', 'KALLAKURICHI OUTSKIRTS', 'July 08, 2026', '/header-banner01.png', 'DONE', TRUE, FALSE);

-- 4. Events Table
CREATE TABLE IF NOT EXISTS `events` (
  `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
  `title` VARCHAR(255) NOT NULL,
  `description` TEXT NOT NULL,
  `date` VARCHAR(100) NOT NULL,
  `time` VARCHAR(100) NOT NULL,
  `venue` VARCHAR(255) NOT NULL,
  `attendees` INT DEFAULT 0,
  `category` VARCHAR(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT IGNORE INTO `events` (`id`, `title`, `description`, `date`, `time`, `venue`, `attendees`, `category`) VALUES
(1, 'Anna Nagar Grievance Redressal Town Hall', 'Direct town hall meeting with local representatives and officials to file public grievances and inspect ward requirements.', 'Aug 18, 2026', '10:00 AM - 01:00 PM', 'Constituency Main Office, Near Central Park', 142, 'Grievance'),
(2, 'Welfare Scheme Distribution Drive', 'Constituency welfare drive distributing educational scholarships, senior citizen aids, and self-employment packages.', 'Aug 21, 2026', '11:00 AM - 02:00 PM', 'Chinnasalem Community Hall', 285, 'Welfare'),
(3, 'Ward 5 Tree Plantation & Green City Drive', 'Community green initiative aiming to plant 1,000 native tree saplings around the playground. Free saplings for residents.', 'Aug 25, 2026', '08:00 AM - 12:00 PM', 'Kaveri Nagar Public Playground', 98, 'Environment');

-- 5. Grievances Table
CREATE TABLE IF NOT EXISTS `grievances` (
  `id` VARCHAR(100) PRIMARY KEY,
  `name` VARCHAR(255) NOT NULL,
  `phone` VARCHAR(100) NOT NULL,
  `ward` VARCHAR(100) NOT NULL,
  `category` VARCHAR(100) NOT NULL,
  `description` TEXT NOT NULL,
  `status` VARCHAR(100) DEFAULT 'PENDING',
  `adminRemarks` TEXT NULL,
  `createdAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 6. Hero Slides Table
CREATE TABLE IF NOT EXISTS `hero_slides` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `desktop` LONGTEXT NOT NULL,
  `mobile` LONGTEXT NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT IGNORE INTO `hero_slides` (`id`, `desktop`, `mobile`) VALUES
(1, '/header-banner01.png', '/header-banner01-mobile.png'),
(2, '/header-banner02.png', '/header-banner02.png'),
(3, '/header-banner0d1.png', '/header-banner0d1.png');

-- 7. Live News Table
CREATE TABLE IF NOT EXISTS `live_news` (
  `id` BIGINT PRIMARY KEY,
  `title` VARCHAR(500) NOT NULL,
  `image` LONGTEXT NOT NULL,
  `content` LONGTEXT NOT NULL,
  `date` VARCHAR(100) NOT NULL,
  `category` VARCHAR(100) NOT NULL,
  `author` VARCHAR(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT IGNORE INTO `live_news` (`id`, `title`, `image`, `content`, `date`, `category`, `author`) VALUES
(1, 'TVK General Secretary Directs Flood-Relief Volunteering Across Kallakurichi', '/header-banner01.png', 'In response to recent torrential monsoon downpours across northern Tamil Nadu, the General Secretary of Tamilaga Vettri Kazhagam (TVK) has officially directed all district office-bearers and volunteer wings across Kallakurichi to mobilize comprehensive on-ground flood relief measures immediately.', 'Aug 18, 2026', 'OFFICIAL NOTICE', "Desk of Hon'ble MLA Mr. C. Arul Vignesh"),
(2, 'MLA Mr. Arul Vignesh Inspects Lake Desiltation & Canal Clearing Works at Chinnasalem', '/completed_water_supply.jpg', 'To ensure long-term groundwater replenishment and prevent seasonal agricultural flooding, MLA Mr. Arul Vignesh conducted an extensive field inspection of ongoing lake desiltation and irrigation canal widening works in Chinnasalem.', 'Aug 15, 2026', 'DEVELOPMENT & INFRASTRUCTURE', "Desk of Hon'ble MLA Mr. C. Arul Vignesh"),
(3, 'Official TVK Youth Welfare and Education Center Inaugurated in Kallakurichi Town', '/header-banner02.png', 'A state-of-the-art TVK Youth Welfare and Education Center was officially inaugurated in Kallakurichi Town to empower students, competitive exam aspirants, and young job seekers from economically weaker sections.', 'Aug 10, 2026', 'EDUCATION & YOUTH', "Desk of Hon'ble MLA Mr. C. Arul Vignesh"),
(4, 'Public Grievance Redressal Camp: MLA Mr. Arul Vignesh Directs Speedy Action on 200+ Petitions', '/completed_streetlights.jpg', 'At the monthly constituency-wide Public Grievance Redressal Camp held at the Central Office, MLA Mr. Arul Vignesh personally met with hundreds of citizens from across all municipal wards and village panchayats.', 'Aug 05, 2026', 'CITIZEN SERVICES', "Desk of Hon'ble MLA Mr. C. Arul Vignesh");

-- 8. Volunteer Slides Table
CREATE TABLE IF NOT EXISTS `volunteer_slides` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `desktop` LONGTEXT NOT NULL,
  `mobile` LONGTEXT NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT IGNORE INTO `volunteer_slides` (`id`, `desktop`, `mobile`) VALUES
(1, '/header-banner01.png', '/header-banner01-mobile.png'),
(2, '/header-banner02.png', '/header-banner02.png');

-- 9. Appointments Table
CREATE TABLE IF NOT EXISTS `appointments` (
  `id` VARCHAR(100) PRIMARY KEY,
  `name` VARCHAR(255) NOT NULL,
  `mobile` VARCHAR(100) NOT NULL,
  `email` VARCHAR(255) NULL,
  `constituency` VARCHAR(100) NOT NULL DEFAULT 'Kallakurichi',
  `taluk` VARCHAR(100) NOT NULL,
  `village` VARCHAR(100) NOT NULL,
  `preferredDate` VARCHAR(100) NOT NULL,
  `fullAddress` TEXT NOT NULL,
  `purpose` TEXT NOT NULL,
  `timeSlot` VARCHAR(255) NULL,
  `status` VARCHAR(100) DEFAULT 'PENDING',
  `adminRemarks` TEXT NULL,
  `createdAt` VARCHAR(100) NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 10. Volunteers Table
CREATE TABLE IF NOT EXISTS `volunteers` (
  `id` VARCHAR(100) PRIMARY KEY,
  `name` VARCHAR(255) NOT NULL,
  `age` VARCHAR(50) NULL DEFAULT '25',
  `bloodGroup` VARCHAR(50) NULL DEFAULT 'O+',
  `mobile` VARCHAR(100) NOT NULL,
  `email` VARCHAR(255) NULL,
  `constituency` VARCHAR(100) NOT NULL DEFAULT 'Kallakurichi',
  `taluk` VARCHAR(100) NOT NULL,
  `village` VARCHAR(100) NOT NULL,
  `fullAddress` TEXT NOT NULL,
  `image` LONGTEXT NULL,
  `status` VARCHAR(100) DEFAULT 'PENDING',
  `adminRemarks` TEXT NULL,
  `createdAt` VARCHAR(100) NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 11. Volunteer Photos Table
CREATE TABLE IF NOT EXISTS `volunteer_photos` (
  `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
  `image` LONGTEXT NOT NULL,
  `title` VARCHAR(500) NULL,
  `volunteerName` VARCHAR(255) NULL DEFAULT '',
  `volunteerWard` VARCHAR(100) NULL DEFAULT '',
  `uploadedAt` VARCHAR(100) NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 12. Social Posts Table
CREATE TABLE IF NOT EXISTS `social_posts` (
  `id` BIGINT PRIMARY KEY,
  `platform` VARCHAR(50) NOT NULL DEFAULT 'x',
  `postUrl` LONGTEXT NOT NULL,
  `createdAt` VARCHAR(100) NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT IGNORE INTO `social_posts` (`id`, `platform`, `postUrl`, `createdAt`) VALUES
(1, 'x', 'https://x.com/actorvijay/status/1844976727274090714', 'Aug 23, 2026'),
(2, 'x', 'https://x.com/tvkvijayhq/status/1844976727274090714', 'Aug 23, 2026'),
(3, 'instagram', 'https://www.instagram.com/p/DBErV5cTI8B/', 'Aug 23, 2026'),
(4, 'instagram', 'https://www.instagram.com/reel/DBG7Xy9vO3r/', 'Aug 23, 2026');

-- 13. Social Profiles Table
CREATE TABLE IF NOT EXISTS `social_profiles` (
  `id` INT PRIMARY KEY,
  `xProfileLink` LONGTEXT,
  `instagramProfileLink` LONGTEXT,
  `motivationalQuoteEn` TEXT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT IGNORE INTO `social_profiles` (`id`, `xProfileLink`, `instagramProfileLink`, `motivationalQuoteEn`) VALUES
(1, 'https://x.com/TVKVijayHQ', 'https://instagram.com/tvkvijayhq', 'Service to the people is our foremost duty and eternal commitment.');
