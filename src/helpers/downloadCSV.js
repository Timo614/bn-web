export default (rows, name = "data") => {
	let csvContent = "";
	rows.forEach(rowArray => {
		const row = rowArray.join(`","`);
		csvContent += `"${row}"\r\n`;
	});

	const blob = new Blob([csvContent], { type: "text/csv" });
	const href = window.URL.createObjectURL(blob);
	const link = document.createElement("a");
	link.setAttribute("href", href);

	const timeStamp = Math.floor(Date.now() / 1000);
	link.setAttribute("download", `${name}_${timeStamp}.csv`);
	document.body.appendChild(link); // Required for FF

	link.click();

	return true;
};
