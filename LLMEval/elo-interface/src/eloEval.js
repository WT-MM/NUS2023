

export function sortTime(data){
    console.log(data)
    var retData = JSON.parse(JSON.stringify(data))
    retData.sort((a, b) => {return a.timestamp.seconds - b.timestamp.seconds})
    return retData
}