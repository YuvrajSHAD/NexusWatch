#### Straight forward guide.

- if setting up manually, SSH into each server/instance created
- make sure we have python available, create virtual environment inside new folder
- cd into folder, create script.py or js depending on the usecase
- paste the scripts and save and run it.


### To auto run these scripts on restart (Normal restart, not work if you are restarting from like comeplete default state, incase you messed up somewhere)

- You have to set it as daemon and start that deamon as systemctl (i cannot provide script, it will vary cuz right now these instances are exposing 5000 port, so for better protection, bind locally, put it behind a gateway)
- This project just showcase the potential vultr currently holds with this infrastructure spread acrros the world.
- i will keep improving the UI, so that someone can turn this into a business model. (Hey i am not getting paid for this lol.)
