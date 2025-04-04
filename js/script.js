let currentSong = new Audio();
let songs;
let currFolder;

function secondsToMinutesSeconds(seconds) {
    if (isNaN(seconds) || seconds < 0) {
        return "00:00";
    }
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    const formattedMinutes = String(minutes).padStart(2, '0');
    const formattedSeconds = String(remainingSeconds).padStart(2, '0');

    return `${formattedMinutes}:${formattedSeconds}`
}


async function getSongs(folder) {
    currFolder = folder
    let a = await fetch(`/${folder}/`)
    let response = await a.text()

    let div = document.createElement("div")
    div.innerHTML = response

    let as = div.getElementsByTagName("a")
    songs = []

    for (let index = 0; index < as.length; index++) {
        const element = as[index];
        if (element.href.endsWith(".mp3")) {
            songs.push(element.href.split(`/${folder}/`)[1])
        }
    }


    //Show all the songs in the playlist
    let songUL = document.querySelector(".songList").getElementsByTagName("ul")[0]
    songUL.innerHTML = " "
    for (const song of songs) {
        songUL.innerHTML = songUL.innerHTML + `<li> 
                            <img class="invert" src="img/music.svg" alt="music">
                            <div class="info">
                                <div>${song.replaceAll("%20", " ")}</div>
                                <div>Satyam</div>
                            </div>
                            <div class="playNow">
                                <span>Play Now</span>
                                <img class="invert" src="img/play.svg" alt="">
                            </div>  </li>`
    }

    //Attach an event listner to each song
    Array.from(document.querySelector(".songList").getElementsByTagName("li")).forEach(e => {
        e.addEventListener("click", element => {
            console.log(e.querySelector(".info").firstElementChild.innerHTML)
            playMusic(e.querySelector(".info").firstElementChild.innerHTML.trim())
        })
    })

    return songs;
    
}

let playMusic = (track, pause = false) => {
    currentSong.src = `/${currFolder}/` + track
    if (!pause) {
        currentSong.play()
        plays.src = "img/pause.svg"
    }
    document.querySelector(".songinfo").innerHTML = decodeURI(track)
    document.querySelector(".songtime").innerHTML = "00:00 / 00:00"
}

async function displayAlbums() {
    let a = await fetch(`https://github.com/satyam1436/Spotify-Clone/tree/main/songs/`)
    console.log("displayAlbums fetch", a);
    let response = await a.text()
    let div = document.createElement("div")
    div.innerHTML = response

    let anchors = div.getElementsByTagName("a")
    let cardContainer = document.querySelector(".cardContainer")

    let array = Array.from(anchors)
    for (let index = 0; index < array.length; index++) {
        const e = array[index];

        if (e.href.includes("/songs") && !e.href.includes(".htaccess")) {
            let folder = e.href.split("/").slice(-2)[0]
 
            //Get the metadata of the folder
            let a = await fetch(`/songs/${folder}/info.json`)
            let response = await a.json()
            console.log(response)
            cardContainer.innerHTML = cardContainer.innerHTML + `<div data-folder="${folder}" class="card">
                        <div class="play">
                            <div class="circle">
                                <img src="img/play.svg" alt="play">
                            </div>
                        </div>
                        <img src="/songs/${folder}/cover.jpg" alt="card1">
                        <h3>${response.title}</h3>
                        <p>${response.description}</p>
                    </div>`
        }
    }

    //Load the playlist whenever the card is clicked
    Array.from(document.getElementsByClassName("card")).forEach(e => {
        e.addEventListener("click", async items => {
            songs = await getSongs(`songs/${items.currentTarget.dataset.folder}`)
            playMusic(songs[0])
        })
    })
}

async function main() {

    //Get the list of all songs
    await getSongs("songs/ncs")
    playMusic(songs[0], true)

    //Display all the albums on the page
    displayAlbums()

    //Attach event listner to play, next and previous
    plays.addEventListener("click", () => {
        if (currentSong.paused) {
            currentSong.play()
            plays.src = "img/pause.svg"
        }
        else {
            currentSong.pause()
            plays.src = "img/play.svg"
        }
    })

    //Listen for time update event
    currentSong.addEventListener("timeupdate", () => {
        document.querySelector(".songtime").innerHTML = `${secondsToMinutesSeconds(currentSong.currentTime)} / ${secondsToMinutesSeconds(currentSong.duration)}`
        document.querySelector(".dot").style.left = (currentSong.currentTime / currentSong.duration) * 100 + "%";
    })

    //Add event lister to seekbar
    document.querySelector(".seekbar").addEventListener("click", e => {
        let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
        document.querySelector(".dot").style.left = percent + "%";

        currentSong.currentTime = ((currentSong.duration) * percent) / 100;
    })

    //Add an event listner for hamnurger
    document.querySelector(".hamburger").addEventListener("click", () => {
        document.querySelector(".left").style.left = "0";
    })

    //Add an event listner for close button
    document.querySelector(".close").addEventListener("click", () => {
        document.querySelector(".left").style.left = "-120%";
    })

    //Add an event listner to previous button
    previous.addEventListener("click", () => {
        console.log("Previous clicked")
        let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0]);
        if ((index - 1) >= 0) {
            playMusic(songs[index - 1]);
        }
    })

    //Add an event listner to next button
    next.addEventListener("click", () => {
        console.log("next clicked")
        let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0]);
        console.log(index)
        if ((index + 1) < songs.length) {
            playMusic(songs[index + 1]);
        }
    })

    //Add an event to volume
    document.querySelector(".range").getElementsByTagName("input")[0].addEventListener("change", (e) => {
        console.log("Setting volume to", e.target.value, "/ 100")
        currentSong.volume = parseInt(e.target.value) / 100;
    })

    //Add event listner to mute the track
    document.querySelector(".volume>img").addEventListener("click", e => {
        console.log(e.target)
        if(e.target.src.includes("volume.svg")){
            e.target.src = e.target.src.replace("volume.svg","mute.svg")
            currentSong.volume = 0;
            document.querySelector(".range").getElementsByTagName("input")[0].value = 0
        }
        else{
            e.target.src = e.target.src.replace("mute.svg", "volume.svg")
            currentSong.volume = .1;
            document.querySelector(".range").getElementsByTagName("input")[0].value = 10
        }
    })

}

main()  
