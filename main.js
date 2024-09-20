const TEAM_FOLDER = '/nisca/content/nisca/2022-2023/boysswimming/princeton-princeton/'
const TEAM_NAME = 'Princeton'
const gabbr = "M"

var order = ['A200Y', 'E200Y', 'A50Y', 'D100Y', 'A100Y', 'A500Y', 'B100Y', 'C100Y']
var swimmers
var powerpoints = {} 

// read TEAM_LINEUP file using fetch and $.csv.toArray(
async function readLineup(team_folder){
    const lineup = await fetch(team_folder+'/values.csv').then(res => res.text())
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
    })
    swimmers = [...new Set(data.map(d => d['id']))]
    return data
}

// create a table of checkboxes with columns given by "order" and rows given by "swimmers", with bootstrap styling 
// the first column should list the swimmers and the first row should list the events
function createTable(order, swimmers){
    var table = document.createElement('table')
    table.className = "table table-bordered"
    var thead = document.createElement('thead')
    var tbody = document.createElement('tbody')
    table.appendChild(thead)
    table.appendChild(tbody)

    // create header row
    var tr = document.createElement('tr')
    thead.appendChild(tr)
    tr.appendChild(document.createElement('th'))
    order.forEach(event => {
        var th = document.createElement('th')
        th.innerHTML = event
        th.dataset.event = event
        // when clicked, sort the table by powerpoints in the given event
        th.onclick = function(e){
            sortTable(e.target.dataset.event)
        }
        tr.appendChild(th)
    })

    // create rows
    swimmers.forEach(swimmer => {
        var tr = document.createElement('tr')
        tbody.appendChild(tr)
        var th = document.createElement('th')
        th.innerHTML = swimmer
        tr.appendChild(th)

        order.forEach(event => {
            var td = document.createElement('td')
            td.dataset.swimmer = swimmer
            td.dataset.event = event

            // Create an invisible checkbox (not appended to td)
            var checkbox = document.createElement('input')
            checkbox.type = "checkbox"
            checkbox.id = swimmer + event
            checkbox.style.display = 'none' // Make the checkbox invisible

            // Add click event to toggle bg-info on the td cell
            td.addEventListener('click', onClickCheckBox)

            // Add powerpoints to the td element in bold
            var label = document.createElement('label')
            label.style.fontWeight = 'bold' // Make powerpoints bold
            var key = swimmer + '|' + event
            var pp = powerpoints[key]

            // Assign a data attribute to the td element
            td.dataset.powerpoints = pp || 0

            // Set label content to powerpoints if available
            if (pp) {
                label.innerHTML = pp
            }

            td.appendChild(label)
            td.appendChild(checkbox)
            tr.appendChild(td)

        })
    })

    // in the top le

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
    tds.forEach(td => {
        var event = td.dataset.event
        var swimmer = td.dataset.swimmer
        if (td.classList.contains('bg-info')) {
            eventsChecked[event] = eventsChecked[event] + 1 || 1
            swimmersChecked[swimmer] = swimmersChecked[swimmer] + 1 || 1
        }
    })
    // now gray out the cells that would violate the constraints if they where to be clicked
    tds.forEach(td => {
        var event = td.dataset.event
        var swimmer = td.dataset.swimmer
        if (eventsChecked[event] > 2 || swimmersChecked[swimmer] > 3) {
            td.style.backgroundColor = 'lightgray'
        } else {
            td.style.backgroundColor = 'white'
        }
    })
}

function getCurrentAssignment(){
    var tds = document.querySelectorAll('td')
    var assignment = {}
    var totalPowerpoints = 0
    tds.forEach(td => {
        var swimmer = td.dataset.swimmer
        var event = td.dataset.event
        if (td.classList.contains('bg-info')) {
            assignment[swimmer] = assignment[swimmer] || []
            assignment[swimmer].push(event)
            var key = swimmer + '|' + event
            var pp = powerpoints[key]
            totalPowerpoints += pp
        }
    })
    return [assignment, totalPowerpoints]
}

// use bg-info class to highlight the cell when clicked, also enforce constraints.
function onClickCheckBox(event){
    var td = event.target;
    if(td.tagName != 'TD'){
        td = td.parentElement
    }
    var checkbox = td.querySelector('input');
    console.log(td, checkbox)
    if (td.classList.contains('bg-info')) {
        td.classList.remove('bg-info')
        checkbox.checked = false
    } else {
        td.classList.add('bg-info')
        checkbox.checked = true
    }
    // no more than 3 swimmers per event
    var event = td.dataset.event
    enforceSwimmerPerEvent(event, td, checkbox)

    // no more than 4 events per swimmer
    var swimmer = td.dataset.swimmer
    enforceEventPerSwimmer(swimmer, td, checkbox);

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
function sortTable(event){
    console.log('sorting by', event)
    var table = document.getElementsByTagName('table')[0]
    var rows = Array.from(table.getElementsByTagName('tr')).slice(1)
    var index = order.indexOf(event)// add 1 to account for the swimmer column
    console.log(index)
    rows.sort((a,b) => {
        var a_powerpoints = a.getElementsByTagName('td')[index].dataset.powerpoints
        var b_powerpoints = b.getElementsByTagName('td')[index].dataset.powerpoints
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
}

window.onload = main