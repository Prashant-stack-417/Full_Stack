const data = [
    {
        city:"Ahmedabad",
        temp: 40
    },
    {
        city:"Vadodara",
        temp: 38
    },
    {
        city:"Nadiad",
        temp: 39
    }
]

const selectTag = document.querySelector("#js_select")
const button = document.querySelector(".result_btn");
const result = document.querySelector("#result");

const handleClick = () => {
    result.innerHTML = `The Weather in ${selectTag.value} is ${data.find(city=>city.city===selectTag.value).temp} C`;      
}

selectTag.innerHTML = data.map((city) =>
  `<option value="${city.city}">${city.city}</option>`
).join('');
