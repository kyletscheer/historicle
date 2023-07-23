<?php

// Load the JSON data from a file
$json_data = file_get_contents('dates.json');

// Decode the JSON data into a PHP array
$data = json_decode($json_data, true);
?>
<table>
	<thead>
		<th>number</th>
		<th>date</th>
		<th>event</th>
		<th>link</th>
		<th>hint</th>
	</thead>
	<tbody>
<?php
// Loop through the data array and display each item
$i = 1;
foreach ($data as $item) {
    $date = $item['date'];
    $event = $item['event'];
    $link = $item['link'];
    $hint = $item['hint'];
	echo "<tr><td>$i</td><td>$date</td>";
    echo "<td>$event</td>";
    echo "<td>$link</td>";
	echo "<td>Hint: $hint</td></tr>";
	$i++;
}

?>