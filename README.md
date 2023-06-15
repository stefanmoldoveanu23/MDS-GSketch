# MDS-GSketch
Group project for MDS - A website where multiple people can use a whiteboard simultaneously

## Info
- Team name: Moluvi
- Team members: Moldoveanu Ștefan (252), Lung Alexandra (252), Vișan Alexandru (252).



## Use case diagram
<img src = "/uml/use_case.png" width = 800 height = 800>

## Class diagram
<img src = "/uml/class_diagram.png" width = 800 height = 800>

## User stories

User = Anyone who uses the application. 

Authenticated User = A user that has logged in the application.

Non-Authenticated User = A user that has not yet logged in the application.

Host = A user who owns a board. 

Guest = A user who collaborates to a board they do not own. 

1. As a Non-Authenticated User I want to be able to create a new account so that I can log in the app.
2. As a Non-Authenticated User I want to be able to access boards in order to become a Guest.
3. As a Non-Authenticated User I want to be able to log in the app so that I can become an Authenticated User.

4. As an Authenticated User I want to be able to create an empty board so that I can become a Host. 
5. As an Authenticated User I want to be able to access boards in order to become a Guest.
6. As an Authenticated User I want to be able to log out of the app so that I can become an Non-Authenticated User.

7. As a Host I want to share the board I own using a PIN so that other Users can access that board.
8. As a Host I want to be able to restrict the access to the board of the Guests so that ill intended Guests do not interfere with my work. 

9. As a Host/Guest I want to be able to use geometric tools to draw on the board.
10. As a Host/Guest I want to be able to use a brush to paint on the board.
11. As a Host/Guest I want my work to be saved so that I can resume working after some time. 
12. As a Host/Guest I want my changes to the board to be seen in real time by other Users so that everyone always sees the latest version of the board. 
13. As a Host/Guest I want some way of exporting my work from the web application to my own computer so that I can have a local copy of my work. 
14. As a Host/Guest I want to be able to undo the board to a previous state so that I can discard any unwanted changes. 
15. As a Host/Guest I want to be able to choose a nickname so that other Users are aware of who I am. 

## Backlog 

We monitorized our backlog using Trello. It can be found [here](https://trello.com/b/wWCwnMpM/mds).
