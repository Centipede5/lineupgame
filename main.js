const TEAM_FOLDER = '/nisca/content/nisca/2022-2023/boysswimming/westfield-westfield/'
const TEAM_NAME = 'Westfield'
const gabbr = "M"

var order = ['RE200Y'+gabbr,'A200Y', 'E200Y', 'A50Y','D100Y', 'A100Y', 'A500Y','RA200Y'+gabbr, 'B100Y', 'C100Y', 'RA400Y'+gabbr]
var relayOrder = {}
relayOrder['RE200Y'+gabbr] = ['B50Y','C50Y','D50Y','A50Y']
relayOrder['RA200Y'+gabbr] = ['A50Y','A50Y','A50Y','A50Y']
relayOrder['RA400Y'+gabbr] = ['A100Y','A100Y','A100Y','A100Y']



var swimmers
var powerpoints = {} 
var times = {}
var relayTimes = {}

// read TEAM_LINEUP file using fetch and $.csv.toArray(
async function readLineup(team_folder){

    const relayLineup = await fetch(HOST+'/westfield-RELAYS.L1/westfield-RELAYS.L1').then(res => res.text())
    var relayData = await $.csv.toObjects(relayLineup);
    window.relayData = relayData
    // if relayData.set == time then convert it from set,event,num,swimmer1,swimmer2,swimmer3,swimmer4,time,powerpoints to set,name,event,time 
    relayData = relayData.map(d => {
        if(d['set'] == 'time'){
            var set = d['set']
            var name = d['event']
            var event = d['num']
            var time = d['swimmer1']
            d = {set, name, event, time}
            var key = name + '|' + event
            relayTimes[key] = time
        }else{
            // make a powerpoints key for each relay team: first sort the swimmers by name then add the event to the key
            var swimmers = [d['swimmer1'],d['swimmer2'],d['swimmer3'],d['swimmer4']]
            swimmers.sort()
            var key = swimmers.join('|') + '|' + d['event']
            powerpoints[key] = d['powerpoints']
        }
    });

    const lineup = await fetch(HOST+team_folder+'/values.csv').then(res => res.text())
    var data = await $.csv.toObjects(lineup);

    data = data.map(d => {
        d['event'] = d['stroke']+d['distance']+d['course']
        d['powerpoints'] = d['powerpoints']-0 // convert to number
        return d
    })
    // set swimmer-event pairings in powerpoints
    data.forEach(d => {
        var key = d['id']+'|'+d['event']
        powerpoints[key] = d['powerpoints']
        times[key] = d['time']
    })
    swimmers = [...new Set(data.map(d => d['id']))]
    
    return data
}

// create a table of checkboxes with columns given by "order" and rows given by "swimmers", with bootstrap styling 
// the first column should list the swimmers and the first row should list the events

function createTable(order, swimmers) {
    var table = document.createElement('table')
    table.className = "table table-bordered"
    var thead = document.createElement('thead')
    var tbody = document.createElement('tbody')
    table.appendChild(thead)
    table.appendChild(tbody)

    // create header row
    var tr = document.createElement('tr')
    thead.appendChild(tr)
    tr.appendChild(document.createElement('th')) // Empty top-left cell

    order.forEach(event => {
        if (event.startsWith("R")) {
            // Relay event, create 4 subcolumns
            for (let i = 1; i <= 4; i++) {
                var th = document.createElement('th')
                th.innerHTML = `${event}<br/>(${i}: ${relayOrder[event][i-1]})`
                th.dataset.event = event
                th.dataset.relaySwimmer = i
                th.dataset.column = event + i
                th.style.cursor = 'pointer'

                // when clicked, sort the table by powerpoints in the given relay subcolumn
                th.onclick = function(e) {
                    sortTable(e.target.dataset.column)
                }
                tr.appendChild(th)
            }
        } else {
            // Regular event, create a single column
            var th = document.createElement('th')
            th.innerHTML = event
            th.dataset.event = event
            th.style.cursor = 'pointer'

            // when clicked, sort the table by powerpoints in the given event
            th.onclick = function(e) {
                sortTable(e.target.dataset.event)
            }
            tr.appendChild(th)
        }
    })

    // create rows
    swimmers.forEach(swimmer => {
        var tr = document.createElement('tr')
        tbody.appendChild(tr)
        var th = document.createElement('th')
        th.innerHTML = swimmer
        tr.appendChild(th)

        order.forEach(event => {
            if (event.startsWith("R")) {
                // Relay event, create 4 cells (one for each relay swimmer)
                for (let i = 1; i <= 4; i++) {
                    var td = document.createElement('td')
                    td.dataset.swimmer = swimmer
                    td.dataset.event = event
                    td.dataset.relaySwimmer = i
                    td.dataset.column = event + i

                    // Create an invisible checkbox (not appended to td)
                    var checkbox = document.createElement('input')
                    checkbox.type = "checkbox"
                    checkbox.id = swimmer + event + "Swimmer" + i
                    checkbox.style.display = 'none' // Make the checkbox invisible

                    // Add click event to toggle bg-info on the td cell
                    td.addEventListener('click', onClickCheckBox)

                    // Add powerpoints to the td element in bold
                    var label = document.createElement('label')
                    // make times monospace
                    label.style.fontFamily = 'monospace'
                    var relayEvent = relayOrder[event][i-1]
                    var key = swimmer + '|' + relayEvent;

                    var pp = powerpoints[key]

                    var time = relayTimes[key]

                    // Assign a data attribute to the td element
                    td.dataset.powerpoints = pp || 0
                    td.dataset.sortBy = 0;

                    // Set label content to powerpoints if available
                    if (time) {
                        td.dataset.sortBy = 1/time
                        label.innerHTML = renderTime(time)
                    }
                    
                

                    td.appendChild(label)
                    td.appendChild(checkbox)
                    tr.appendChild(td)
                }
            } else {
                // Regular event, create a single cell
                var td = document.createElement('td')
                td.dataset.swimmer = swimmer
                td.dataset.event = event
                td.dataset.column = event

                // Create an invisible checkbox (not appended to td)
                var checkbox = document.createElement('input')
                checkbox.type = "checkbox"
                checkbox.id = swimmer + event
                checkbox.style.display = 'none' // Make the checkbox invisible

                // Add click event to toggle bg-info on the td cell
                td.addEventListener('click', onClickCheckBox)

                // Add powerpoints to the td element in bold
                var label = document.createElement('label')
                // make times monospace
                label.style.fontFamily = 'monospace'
                var key = swimmer + '|' + event
                var pp = powerpoints[key]
                
                var time = times[key]

                // Assign a data attribute to the td element
                td.dataset.powerpoints = pp || 0
                td.dataset.sortBy = pp || 0
                td.dataset.disabled = false

                // Set label content to powerpoints if available
                if (time) {
                    label.innerHTML = renderTime(time)
                }

                // add a small red italicized font to display the powerpoints
                if(pp !== undefined){
                    var small = document.createElement('small')
                    small.style.color = 'red'
                    small.style.fontWeight = 'bold'
                    small.innerHTML = ` (${pp})`
                    label.appendChild(small)
                }

                td.appendChild(label)
                td.appendChild(checkbox)
                tr.appendChild(td)
            }
        })
    })

    return table
}





function enforceSwimmerPerEvent(event,td,checkbox){
    var checked = Array.from(document.querySelectorAll('td[data-event="'+event+'"].bg-info')).length
    if (checked > 3) {
        alert('No more than 3 swimmers per event')
        td.classList.remove('bg-info')
        checkbox.checked = false
    }
}

function enforceEventPerSwimmer(swimmer,td,checkbox){
    var checked = Array.from(document.querySelectorAll('td[data-swimmer="'+swimmer+'"].bg-info')).length
    if (checked > 4) {
        alert('No more than 4 events per swimmer')
        td.classList.remove('bg-info')
        checkbox.checked = false
    }
}

function grayOut(){
    // gray out all the cells that would violate the constraints if clicked 
    var tds = document.querySelectorAll('td')
    var eventsChecked = {}
    var swimmersChecked = {}
    var swimmersIndividualChecked = {}
    var swimmersRelays = {}
    var relaysFilled = {}
    // add all the relay events as 'relay':{} to the eventsChecked object
    order.forEach(event => {
        if (event.startsWith('R')) {
            swimmersRelays[event] = {}
        }
    })
    tds.forEach(td => {
        var event = td.dataset.event
        var swimmer = td.dataset.swimmer
        if (td.classList.contains('bg-info')) {
            eventsChecked[event] = eventsChecked[event] + 1 || 1
            swimmersChecked[swimmer] = swimmersChecked[swimmer] + 1 || 1
            if (event.startsWith('R')) {
                swimmersRelays[event][swimmer] = swimmersRelays[event][swimmer] + 1 || 1
                // fill relaysFilled with the number of swimmers per relay event-swimmer combination
                var relaySwimmer = td.dataset.relaySwimmer
                var relayEvent = event
                relaysFilled[relayEvent+relaySwimmer] = relaysFilled[relayEvent+relaySwimmer] + 1 || 1

            }else{
                swimmersIndividualChecked[swimmer] = swimmersIndividualChecked[swimmer] + 1 || 1
            }
        }
    })
    // now gray out the cells that would violate the constraints if they where to be clicked
    tds.forEach(td => {
        var event = td.dataset.event;
        var swimmer = td.dataset.swimmer;
        
        var relaySwimmer = td.dataset.relaySwimmer
        if(event.startsWith('R')&&(relaysFilled[event+relaySwimmer] > 1||swimmersRelays[event][swimmer] >= 1)){
            td.style.backgroundColor = 'lightgray'
            td.dataset.disabled = 'true'
        }else if (!(event.startsWith('R')) && (eventsChecked[event] > 2 || swimmersChecked[swimmer] > 3  || (event.startsWith('R') && swimmersRelays[event][swimmer] >= 1))) {
            td.style.backgroundColor = 'lightgray'
            td.dataset.disabled = 'true'
        } else if(swimmersIndividualChecked[swimmer] > 1 && !event.startsWith('R')){
            td.style.backgroundColor = 'lightgray'
            td.dataset.disabled = 'true'
        } else {
            td.style.backgroundColor = 'white'
            td.dataset.disabled = 'false'
        }
    })
}

function calculateRelayPowerPoints(relayEvent, event){

    console.log(relayEvent, event, relayOrder[event])
    // first break into 2 teams, first team is the fastest swimmers for each event, second team is the second fastest swimmers
    var team1 = []
    var team2 = []
    for(var relaySwimmer in relayEvent){
        var indEvent = relayOrder[event][relaySwimmer-1]
        var key = relayEvent[relaySwimmer].map(swimmer => swimmer + '|' + indEvent)

        // console.log('times: ',key,key.map(k => relayTimes[k]))
        var sorted = key.sort((a,b) => relayTimes[a] - relayTimes[b])
        team1.push(sorted[0])
        team2.push(sorted[1])
    }
    // make sure only defined strings 
    team1 = team1.filter(x => x)
    team2 = team2.filter(x => x)

    // calculate the time for each team
    var time1 = team1.reduce((acc,curr) => acc + (relayTimes[curr]-0),0)
    var time2 = team2.reduce((acc,curr) => acc + (relayTimes[curr]-0),0)
    // calculate the powerpoints for each team using calcRelayPowerPoints(event, time) [only accept 4 person teams]
    var pp1 = 0;
    var pp2 = 0;
    if(team1.length == 4){
        pp1 = calcRelayPowerPoints(event,time1)
    }
    if(team2.length == 4){
        pp2 = calcRelayPowerPoints(event,time2)
    }
    // console.log('team1',team1,pp1)
    // console.log('team2',team2,pp2)
    return pp1 + pp2
}

function getCurrentAssignment(){
    var tds = document.querySelectorAll('td')
    var assignment = {}
    var totalPowerpoints = 0
    var relays = {}
    for(var event in relayOrder){
        relays[event] = {}
    }
    tds.forEach(td => {
        var swimmer = td.dataset.swimmer
        var event = td.dataset.event
        if (td.classList.contains('bg-info')) {
            // non-relay event
            if(!event.startsWith('R')){
                assignment[swimmer] = assignment[swimmer] || []
                assignment[swimmer].push(event)
                var key = swimmer + '|' + event
                var pp = powerpoints[key]
                
                totalPowerpoints += pp
            } else {
                var relaySwimmer = td.dataset.relaySwimmer
                // relay event, just add swimmers to the relay object
                if(!relays[event][relaySwimmer]){
                    relays[event][relaySwimmer] = []
                }
                relays[event][relaySwimmer].push(swimmer)          
            }
        }
    })
    for(var event in relays){
        totalPowerpoints += calculateRelayPowerPoints(relays[event],event)
    }
    assignment['relays'] = relays
    console.log(relays)
    return [assignment, totalPowerpoints]
}

// use bg-info class to highlight the cell when clicked, also enforce constraints.
function onClickCheckBox(event){

    var td = event.target;
    while(td.tagName != 'TD'){
        td = td.parentElement
    }
    
    var checkbox = td.querySelector('input');
    if(td.dataset.disabled == 'true' && !checkbox.checked){
        // alert with rules
        if(td.dataset.event.startsWith('R')){
            alert('No more than 2 relay teams per event. \nNo more than 4 swimmers per relay team\nSwimmers may only swim once per relay event\nNo more than 2 individual events / 4 events total per swimme')
        } else{
            alert('No more than 3 swimmers per event\nNo more than 2 individual events / 4 events total per swimmer')
        }
        return
    }
    console.log(td, checkbox)
    if (td.classList.contains('bg-info')) {
        td.classList.remove('bg-info');
        checkbox.checked = false
    } else {
        td.classList.add('bg-info')
        checkbox.checked = true
    }


    // gray out the cells that would violate the constraints if clicked
    grayOut()

    // get the current assignment and total powerpoints
    var [assignment, totalPowerpoints] = getCurrentAssignment()
    handleCountupChange(totalPowerpoints)
}

function clearAll(){
    var tds = document.querySelectorAll('td')
    tds.forEach(td => {
        td.classList.remove('bg-info')
        var checkbox = td.querySelector('input')
        checkbox.checked = false
    });
    grayOut();
    handleCountupChange(0)
}

// ability to sort the table by powerpoints in a given event
function sortTable(column){
    console.log('sorting by', column)
    var table = document.getElementsByTagName('table')[0]
    var rows = Array.from(table.getElementsByTagName('tr')).slice(1)
    rows.sort((a,b) => {
        var a_powerpoints = a.querySelector(`td[data-column="${column}"]`).dataset.sortBy
        var b_powerpoints = b.querySelector(`td[data-column="${column}"]`).dataset.sortBy
        return b_powerpoints - a_powerpoints
    })
    rows.forEach(row => table.appendChild(row))
}

async function main(){
    const lineup = await readLineup(TEAM_FOLDER)
    console.log(lineup)
    console.log(swimmers);

    var table = createTable(order, swimmers)
    // add to the document "main" div
    document.getElementById('main').appendChild(table)

    // hide loadingModal bootstrap modal object
    loadingModal.hide()

    
}

window.onload = main