let forAdminAttention = []; //USERS WHO'LL NEED ADMIN ATTENTION

class Member
{
    constructor(name, giftType, gift2D, gift3D, giftWrite, ban)
    {
      this.name = name;
      this.giftType = giftType; //0 = 2D, 1 = 3D, 2 = WRITING.
      this.giftsok = [gift2D, gift3D, giftWrite]; //ARRAY OF BOOLS
      this.ban = ban; //ARRAY OF MEMBERS USER NOT COMPATIBLE WITH
      this.giftee = null; //OBJECT OF ASSIGNED GIFTEE
      this.gifter = null; //OBJECT OF ASSIGNED GIFTER
      this.done = false; //FOR MODS IF ART IS DONE AND SUBMITTED
      this._compatibleGiftees = []; //ALL POTENTIAL GIFTEES FOR CURRENT EVENT
      this._compatibleGifters = []; //ALL POTENTIAL GIFTERS FOR CURRENT EVENT
      this._isStraggler = false; //REQUIRES SECOND ATTEMPT
      this.needsAdmin = false; //NO MORE ATTEMPTS TALK TO ADMIN
    }
}
  
const participants =
[
/*     new Member("ace", 0, true, false, false, ["dan", "fig"]),
    new Member("bee", 0, true, true, true, ["cat", "fig"]),
    new Member("cat", 1, true, true, false, ["fig"]),
    new Member("dan", 2, true, true, true, ["elf", "fig"]),
    new Member("elf", 1, false, true, false, ["hat", "fig"]),
    new Member("fig", 0, true, false, true, []),
    new Member("gal", 0, true, true, true, ["fig"]) */

    new Member("ace", 0, true, true, true, []),
    new Member("bee", 0, true, true, true, []),
    new Member("cat", 1, true, true, true, []),
    new Member("dan", 2, true, true, true, []),
    new Member("elf", 1, true, true, true, []),
    new Member("fig", 0, true, true, true, []),
    new Member("gal", 0, true, true, true, [])
];

function reset ()
{
    participants.forEach(function (user){
        user.giftee = null;
        user.gifter = null;
        user.done = false;
        user._compatibleGiftees = [];
        user._compatibleGifters = [];
        user._isStraggler = false;
        user.needsAdmin = false;
    })
}
  
function getRandomElement(array, exceptions)
{
    //RETURNS RANDOM ELE FROM ARRAY
    let element = array[Math.floor(Math.random() * array.length)];
    //ELEMENTS IN EXCEPTIONS ARRAY IF PROVIDED ARE EXCLUDED
    if(exceptions){
        while (exceptions.includes(element)){
            element = array[Math.floor(Math.random() * array.length)];
        }
    }
    return element;
}

function pairAllParticipants ()
{
    //ARRAY FOR RANDOMLY SHUFFLED PARTICIPANTS
    let candidates = [];
    //ARRAY THAT WILL HOLD THE UNSUCCESSFULLY SORTED (happens only if ban and/or gift prefs added)
    let stragglers = [];
    //SHUFFLING PARTICIPANTS RANDOMLY AND ADDING TO NEW ARRAY
    for (let i = 0; i < participants.length; i++){
        while (candidates.length < i + 1){
            let user = getRandomElement(participants);
            if (candidates.includes(user) === false){
                candidates.push(user);
            }
        }
    }

    for (let i = 0; i < candidates.length; i++){
        //FINDS ALL POTENTIAL GIFTEES/GIFTERS FOR PARTICIPANT
        getAllCompatible(candidates[i], candidates);
        //ASSIGNS GIFTEE TO PARTICIPANT
        assignParticipant(candidates[i]);
        if (candidates[i].giftee){
            console.warn(candidates[i].name, ' giftee: ', candidates[i].giftee, ' gifter: ', candidates[i].gifter);
        }
    }
    //PUSH ALL WITH NO GIFTEE OR GIFTER INTO STRAGGLER
    candidates.forEach(user => {
        if (user.giftee === null || user.gifter === null){
            user._isStraggler = true;
            stragglers.push(user);
            console.log(user.name, ' ADDED to Stragglers');
            //IF STRAGGLER IS ALSO .needsAdmin POP OFF FROM STRAGGLER LIST
            forAdminAttention.forEach(element => {
                if (element === user){
                    stragglers.pop();
                    console.log('REMOVED ', user.name, ' from Stragglers');
                }
            })
        }
    })
    //RUN EACH STRAGGLER THROUGH SPLICE PAIRER
    stragglers.forEach(user => {
        assignParticipant(user);
        console.warn(user.name, ' giftee: ', user.giftee, ' gifter: ', user.gifter);
    })

    console.log(candidates);
    console.error('List for ADMIN review: ', forAdminAttention);
}

function getAllCompatible (user, candidates)
{
    //BAN CHECKS
    for (let i = 0; i < candidates.length; i++){
        if (candidates[i] !== user){
            user._compatibleGiftees.push(candidates[i]);
            if (banCheck(user, candidates[i])){
                user._compatibleGiftees.pop();
                console.warn(user.name, 'bans ', candidates[i].name);
            }
            else{
                if(banCheck(candidates[i], user)){
                    user._compatibleGiftees.pop();
                    console.warn('candidate ', candidates[i].name, ' bans ', user.name);
                }
            }
        }
    }
    console.log('Unbanned Potential Giftees: ', user._compatibleGiftees, ' before GIFT check');
    //SPREAD OPERATOR TO SHALLOW COPY GIFTEES BAN-CHECKED LIST
    user._compatibleGifters = [...user._compatibleGiftees];
    //CHECK IF POTENTIAL GIFTEES GIFT PREFS COMPATIBLE WITH USER GIFT TYPE
    user._compatibleGiftees.forEach((candidate, index)=>{
        if (candidate.giftsok[user.giftType] === false){
            user._compatibleGiftees.splice(index, 1);
        }
    })
    //CHECK IF POTENTIAL GIFTERS GIFT TYPE COMPATIBLE WITH USER GIFT PREFS
    user._compatibleGifters.forEach((candidate, index)=>{
        if (user.giftsok[candidate.giftType] === false){
            user._compatibleGifters.splice(index, 1);
        }
    })
    // IF INCOMPATIBLE WITH NON, NEEDS ADMINISTRATION
    if (user._compatibleGiftees.length === 0 || user._compatibleGifters.length === 0){
        user.needsAdmin = true;
        forAdminAttention.push(user);
        console.warn(user.name, ' None compatible. See ADMIN.');
        return;
    }
}

function banCheck (user, candidate)
{
    //CHECKS IF CANDIDATE IS ON USER'S BAN LIST
    if (user.ban.length === 0){
        return false;
    }
    else{
        for (let i = 0; i < user.ban.length; i++){
            if (user.ban[i] === candidate.name){
                return true;
            }
        }
    }
    return false;
}

function assignParticipant (user)
{
    console.error(user.name);
    let potentialGiftees = user._compatibleGiftees;
    let potentialGifters = user._compatibleGifters;
    let giftee = null;

    console.log('Gift Compatible Potential Giftees: ', potentialGiftees);
    console.log('Gift Compatible Potential Gifters: ', potentialGifters);

    if (!user.giftee){
        if (potentialGiftees.length > 0){
            let exceptions = [];
            while (giftee === null){
                giftee = getRandomElement(potentialGiftees, exceptions);
                if (giftee.gifter){
                    if (exceptions.includes(giftee)){
                        giftee = null;
                    }
                    else{
                        exceptions.push(giftee);
                        giftee = null;
                    }
                }
                else{
                    //IF GIFTEE HAS NO GIFTER WE'RE GOOD TO GO
                    user.giftee = giftee;
                    giftee.gifter = user;
                }
                //RAN THROUGH EACH POTENTIAL CANDIDATE NON WORK
                if (exceptions.length >= potentialGiftees.length){
                    if (!forAdminAttention.includes(user)){
                        forAdminAttention.push(user);
                        console.warn(user.name, ' Gifter Present Check loop canceled. See ADMIN.');
                    }
                    break;
                }
            }
        }
    }
}

function spliceCompatibles (user, candidates)
{

}

//////////////////////////////////////////////////
//DOM ELEMENTS
//////////////////////////////////////////////////
  
const sortButton = document.getElementById("sortButton");

sortButton.addEventListener("click", function (){
    reset();
    pairAllParticipants();

    let table = document.getElementById("results");
    let dataKeys = Object.keys(participants[0]);
    table.innerHTML = "";

    createTable(table, participants);
    createTableHead(table, dataKeys);
});


function createTableHead(table, dataKeys)
{
    let thead = table.createTHead();
    let row = thead.insertRow();

    for (let key of dataKeys){
        if (!key.startsWith("_")){
            let th = document.createElement("th");
            let text = document.createTextNode(key);
            th.appendChild(text);
            row.appendChild(th);
        }
    }
}

function createTable(table, object)
{
    for (let element of object){
        let row = table.insertRow();
        for (object in element){

            if (!object.startsWith("_")){
                let cell = row.insertCell();
                let text;
    
                //console.log(getKeyByValue(participants[0], element[object])); //GIVES KEY
                //console.log(element[object]); //GIVES KEY VALUE
                //console.log(element.giftee); //GIVES PARTICIPANT OBJECT FROM ARRAY
                //console.log(Object.keys(element));
    
                if (getKeyByValue(participants[participants.indexOf(element)], element[object]) === 'giftee'){
                    if (element[object] !== null){
                        console.warn('GIFTEE NOT NULL!');
                        console.error(element.name, getKeyByValue(participants[participants.indexOf(element)], element[object]));
                        if (element[object] !== null){
                            text = document.createTextNode(element.giftee.name);
                            cell.append(text);
                        }
                    }
                    else{
                        text = document.createTextNode(element[object]);
                        cell.appendChild(text);
                    }
    
                }
                else if (getKeyByValue(participants[participants.indexOf(element)], element[object]) === 'gifter'){
                    if (element[object] !== null){
                        console.warn('GIFTER NOT NULL!');
                        console.error(element.name, getKeyByValue(participants[participants.indexOf(element)], element[object]));
                        if (element[object] !== null){
                            text = document.createTextNode(element.gifter.name);
                            cell.append(text);
                        }
                    }
                    else{
                        text = document.createTextNode(element[object]);
                        cell.appendChild(text);
                    }
                }
                else{
                    text = document.createTextNode(element[object]);
                    cell.appendChild(text);
                }
                console.log(element.name, ':', element[object]);
            }
        }
    }
}

function getKeyByValue(object, value)
{
    return Object.keys(object).find(key => object[key] === value);
}