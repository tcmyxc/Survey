;function modifyInfo() {
    if ($("#questionnaireTitle").val() == "") {
        alert("问卷标题不能为空！")
    } else if ($("#questionnaireDesc").val() == "") {
        alert("问卷描述不能为空！")
    } else {
        document.getElementById("modifyInfo").submit();
    }
}