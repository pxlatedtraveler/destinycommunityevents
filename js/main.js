let forAdminAttention = []; //Users who'll need flexibility

class Member
{
    constructor(name, giftType, gift2D, gift3D, giftWrite, ban)
    {
      this.name = name;
      this.giftType = giftType; //0 = 2D, 1 = 3D, 2 = writing.
      this.giftsok = [gift2D, gift3D, giftWrite]; //array of bools.
      this.ban = ban; //Array of members user doesn't get along with.
      this.done = false; //For mod. Make true when art is done.
      this.giftee = null; //obj with info of giftee participant.
      this.gifter = null;
    }
}
  
const participants =
[
    new Member("ace", 0, true, false, false, ["dan", "fig"]),
    new Member("bee", 0, true, true, true, ["cat", "fig"]),
    new Member("cat", 1, true, true, false, ["fig"]),
    new Member("dan", 2, true, true, true, ["elf", "fig"]),
    new Member("elf", 1, false, true, false, ["hat", "fig"]),
    new Member("fig", 0, true, false, true, []),
    new Member("gal", 0, true, true, true, ["fig"])
];

function reset ()
{
    participants.forEach(function (user){
        user.giftee = null;
        user.gifter = null;
    })
}
  
function getRandomElement(array, exceptions)
{
    //Returns a random element from array
    let element = array[Math.floor(Math.random() * array.length)];
    //Exceptions is an array holding elements from array to be excluded
    if(exceptions){
        while (exceptions.includes(element)){
            element = array[Math.floor(Math.random() * array.length)];
        }
    }
    return element;
}

function pairAllParticipants ()
{
    //Randomly sort candidates into a new array
    let candidates = [];
    //Those who did not get sorted in one of both categories
    let stragglers = [];
    //Shuffling array into new candidates array
    for (let i = 0; i < participants.length; i++){
        while (candidates.length < i + 1){
            let user = getRandomElement(participants);
            if (candidates.includes(user) === false){
                candidates.push(user);
            }
        }
    }
    //Assigns candidates from randomized array
    for (let i = 0; i < candidates.length; i++){
        assignment(candidates[i], candidates);
        if (candidates[i].giftee){
            console.warn(candidates[i].name, ' giftee: ', candidates[i].giftee, ' gifter: ', candidates[i].gifter);
        }
    }
    console.error('List for ADMIN review: ', forAdminAttention);

    //Push any stragglers with unassigned in either slot in new array for re-assignment
    if (stragglers.length > 0)
    {
        candidates.forEach(user => {
            if (user.giftee === null || user.gifter === null){
                stragglers.push(user);
                console.log(user.name, ' ADDED to Stragglers');
                //If straggler is already in admin list, pop off. Admin list users are helpless cases. IE: banned by all
                forAdminAttention.forEach(element => {
                    if (element === user){
                        stragglers.pop();
                        console.log('REMOVED ', user.name, ' from Stragglers');
                    }
                })
            }
        })
        stragglers.forEach(user => {
            assignment(user, candidates);
            console.warn(user.name, ' giftee: ', user.giftee, ' gifter: ', user.gifter);
        })
    }

    console.log(candidates);
}

function assignment (user, candidates)
{
    console.error(user.name);
    let potentialGiftees = []
    let giftee = null;
    //Ban Checks
    for (let i = 0; i < candidates.length; i++){
        if (candidates[i] !== user){
            potentialGiftees.push(candidates[i]);

            if (banCheck(user, candidates[i])){
                potentialGiftees.pop();
                console.warn(user.name, 'bans ', candidates[i].name);
            }
            else{
                if(banCheck(candidates[i], user)){
                    potentialGiftees.pop();
                    console.warn('candidate ', candidates[i].name, ' bans ', user.name);
                }
            }
        }
    }
    console.log('Unbanned Potential Giftees: ', potentialGiftees);
    //Gift Compatability Check
    potentialGiftees.forEach((candidate, index) =>{
        if (!user.giftee){
            if(candidate.giftsok[user.giftType] === false){
                potentialGiftees.splice(index, 1);
            }
        }
        else if (!user.gifter){
            if(user.giftsok[candidate.giftType] === false){
                potentialGiftees.splice(index, 1);
            }
        }
    })
    console.log('Compatible Gift Potential Giftees: ', potentialGiftees);
    //Check if giftee already has gifter
    if (potentialGiftees.length === 0){
        forAdminAttention.push(user);
        console.warn(user.name, ' None compatible. See ADMIN.');
    }
    else{
        let exceptions = [];
        while (giftee === null){
            giftee = getRandomElement(potentialGiftees, exceptions);
            //NEED TO REFINE GIFTEE/GIFTER conditions. Maybe reintroduce a bool in the member class
            //to refine whether this is the first time user passes through this function or struggles.
            //For now, try going backwards, removing the new else/ifs and removing the struggle iteration.
            if (giftee.gifter){
                if (banCheck(user, giftee.gifter)){
    
                    if (exceptions.includes(giftee)){
                        giftee = null;
                    }
                    else{
                        exceptions.push(giftee);
                        giftee = null;
                    }
                }
                else{
                    if (!user.giftee){
                        user.giftee = giftee;
                        user.gifter = giftee.gifter
                        giftee.gifter.giftee = user;
                        giftee.gifter = user;
                        console.log(user.name, ' NEEDED GIFTEE');
                    }
                    else if (!user.gifter){
                        //this should work after I add equivalent if/else for the gift compatability check
                        //to make sure it's reverse, where it's user.giftsok[candidates.gifting]
                        user.giftee = giftee.giftee; //user given gift by giftee
                        user.gifter = giftee;
                        giftee.giftee.gifter = user;
                        giftee.giftee = user;
                        console.log(user.name, ' NEEDED GIFTER');
                    }
                    //MUST CONSIDER SCENARIO WHERE user IS MISSING GIFTER AND NOT GIFTEE.
                    //I think can rememdy with if/else checking if what's missing is GIFTEE or GIFTER.
                    //Needs a bit of thinking on it's own logic. Current results in user's GIFTEE & GIFTER === user.
                    //If user has giftee already, then old GIFTEE is now missing a GIFTER after line below executes.
/*                     user.giftee = giftee;
                    user.gifter = giftee.gifter
                    giftee.gifter.giftee = user;
                    giftee.gifter = user; */
                    break;
                }
            }
            else{
                user.giftee = giftee;
                giftee.gifter = user;
            }
            if (exceptions.length >= potentialGiftees.length){
                if (!forAdminAttention.includes(user)){
                    forAdminAttention.push(user);
                    console.warn(user.name, ' Gifter Present Check loop canceled. See ADMIN.');
                }
                break;
            }
        }
    }
    
    return giftee;
}

function banCheck (user, nominee)
{
    //Checks if nominee is on user's ban list
    if (user.ban.length === 0){
        return false;
    }else{
        for (let i = 0; i < user.ban.length; i++){
            if (user.ban[i] === nominee.name){
                return true;
            }
        }
    }
    return false;
}
  
const testButton = document.getElementById("testButton");

testButton.addEventListener("click", function (){
    reset();
    pairAllParticipants();

    let table = document.getElementById("results");
    let dataKeys = Object.keys(participants[0]);

    createTable(table, participants);
    createTableHead(table, dataKeys);
});


function createTableHead(table, dataKeys)
{
    let thead = table.createTHead();
    let row = thead.insertRow();

    for (let key of dataKeys)
    {
        let th = document.createElement("th");
        let text = document.createTextNode(key);
        th.appendChild(text);
        row.appendChild(th);
    }
}

function createTable(table, object)
{
    for (let element of object)
    {
        let row = table.insertRow();
        for (object in element)
        {
            let cell = row.insertCell();
            let text;

            //console.log(getKeyByValue(participants[0], element[object])); //GIVES KEY
            //console.log(element[object]); //GIVES KEY VALUE
            //console.log(element.giftee); //GIVES PARTICIPANT OBJECT FROM ARRAY
            //console.log(Object.keys(element));

            if (getKeyByValue(participants[participants.indexOf(element)], element[object]) === 'giftee')
            {
                if (element[object] !== null)
                {
                    console.warn('GIFTEE NOT NULL!');
                    console.error(element.name, getKeyByValue(participants[participants.indexOf(element)], element[object]));
                    if (element[object] !== null)
                    {
                        text = document.createTextNode(element.giftee.name);
                        cell.append(text);
                    }
                }
                else
                {
                    text = document.createTextNode(element[object]);
                    cell.appendChild(text);
                }

            }
            else if (getKeyByValue(participants[participants.indexOf(element)], element[object]) === 'gifter')
            {
                if (element[object] !== null)
                {
                    console.warn('GIFTER NOT NULL!');
                    console.error(element.name, getKeyByValue(participants[participants.indexOf(element)], element[object]));
                    if (element[object] !== null)
                    {
                        text = document.createTextNode(element.gifter.name);
                        cell.append(text);
                    }
                }
                else
                {
                    text = document.createTextNode(element[object]);
                    cell.appendChild(text);
                }
            }
            else
            {
                text = document.createTextNode(element[object]);
                cell.appendChild(text);
            }
            console.log(element.name, ':', element[object]);
        }
    }
}

/* let table = document.getElementById("results");
let dataKeys = Object.keys(participants[0]);

createTable(table, participants);
createTableHead(table, dataKeys); */

function getKeyByValue(object, value)
{
    return Object.keys(object).find(key => 
            object[key] === value);
}