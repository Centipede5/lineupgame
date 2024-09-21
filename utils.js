// render time in seconds as mm:ss.00
function renderTime(time){
    if(time == 'NT'){
        return time
    }
    var minutes = (Math.floor(time/60)).toString().padStart(2,'0')
    var seconds = (time % 60).toFixed(2).padStart(5,'0')
    return `${minutes}:${seconds}`

}


/*
    Quartic Formula coefficients given by the following:
RE200M	                    RA200M	                RA400M
    3.9580080941493802e+003	4.0001825786702707e+003	4.5677865820084789e+003
    -8.1438911676093085e+001	-9.1549286533060922e+001	-4.8956094647713783e+001
    7.0980622631058221e-001	8.8699760169744002e-001	2.2092702982576487e-001
    -3.0677105174265365e-003	-4.2570023916074394e-003	-4.9495146231663526e-004
    5.2531741330582945e-006	8.0910649635607820e-006	4.4020650961410724e-007
*/

function calcRelayPowerPoints(event, time){
    if(event == 'RE200YM'){
        return 3.9580080941493802e+003 -8.1438911676093085e+001 * time + 7.0980622631058221e-001 * Math.pow(time,2) -3.0677105174265365e-003 * Math.pow(time,3) + 5.2531741330582945e-006 * Math.pow(time,4)
    }else if(event == 'RA200YM'){
        return 4.0001825786702707e+003 -9.1549286533060922e+001 * time + 8.8699760169744002e-001 * Math.pow(time,2) -4.2570023916074394e-003 * Math.pow(time,3) + 8.0910649635607820e-006 * Math.pow(time,4)
    }else if(event == 'RA400YM'){
        return 4.5677865820084789e+003 -4.8956094647713783e+001 * time + 2.2092702982576487e-001 * Math.pow(time,2) -4.9495146231663526e-004 * Math.pow(time,3) + 4.4020650961410724e-007 * Math.pow(time,4)
    }
}