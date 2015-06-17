=======
Ticket Master
=============
#If node not installed:
	sudo apt-get install nodejs
##(Program looks for node in /usr/bin/env node)
	
#Get dependencies
	npm install
#Run
	./TicketMaster.js

#Generate auth token
    //Open new tab in browser with generation url
    ./TicketMaster.js gentrello

#Test
    ./TicketMaster.js -k 871a2695a447edbd7ed0e5fa4ea8c390 -t <your generated token> populate



    Usage: TicketMaster [options] [command]


  Commands:

    gentrello [o]           Generate a token generation url for trello. [open: <y>] open url in browser (defaults to yes)
    boards [output]         Retrieve a list of boards currently accessible to the user. Output -> [directory + filename] to place output, defaults to <username>_boards.json.
    lists [output] [board]  Retrieves lists in specified board. Output -> [directory + filename] to place output, defaults to <username>_boards.json.
    populate                Generate a directory structure containing information concerning current user's board layout.

  Options:

    -h, --help                 output usage information
    -V, --version              output the version number
    -k --trello_key <key>      Trello authentication key.
    -t --trello_token <token>  Trello authentication token.



##Commands to implement:

	-[x] Get a list of boards for a given user
	-[x] Get a list of 'columns' for a given user
	-[ ] Get 'tickets' in a column
	-[ ] Get 'comments' for a ticket
	-[ ] Get attachments for a ticket

#Directory Structure:
==
    |
    +- Board
    |    +-- Column
    |    |      +- Ticket
    |    |      |    +- Comment
    |    |      |    +- Comment
    |    |      |    +- Comment
    |    |      |    +- Comment
    |    |      |    +- Attachment
    |    |      |    +- Attachment
    |    |      +- Ticket
    |    |      +- Ticket
    |    |      +- Ticket
    |    +-- Column
    |    +-- Column
    |    +-- Column
    |
    +- Board
    ...


Checklist:
==

	-[x]Board
	-[x]Column
	-[ ]Ticket
	-[ ]Comment
	-[ ]Attachment

