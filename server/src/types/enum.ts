enum Gender {
	MALE = 'male',
	FEMALE = 'female',
	OTHER = 'other'
}

enum Rank {
	NON = 'non rank',
	BEGINNER = 'beginner rank',
	IMMEDIATE = 'immediate rank',
	GREAT = 'great rank',
	ULTRA = 'ultra rank',
	MASTER = 'master rank',
	ELITE = 'elite rank',
	PROFESSIONAL = 'professional rank'
}

enum VoteValue {
	UP_VOTE = 1,
	DOWN_VOTE = -1
}

enum BanOrUnban {
	BAN = 'Ban',
	UNBAN = 'Unban'
}

export { Gender, Rank, VoteValue, BanOrUnban }
