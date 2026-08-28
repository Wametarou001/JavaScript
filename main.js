// 処理
const button_1 = document.getElementById("button_1");
const button_2 = document.getElementById("button_2");

button_1.addEventListener("click", () =>
  {
    alert("良いね！");
  });

button_2.addEventListener("click", () =>
  {
    alert("悪いね！");
  });

// 計算処理
const calcButton = document.getElementById("calc_button");

calcButton.addEventListener("click", () =>
{
  const a = document.getElementById("num1").value;
  const b = document.getElementById("num2").value;

  const valA = a ? math.evaluate(a) : 0;
  const valB = b ? math.evaluate(b) : 0;

  const result = valA + valB;

  document.getElementById("result").textContent = result;
});
