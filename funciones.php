<?php

include 'conexion.php';

function getListaPlanTypes() {
    $link = conexion();
    $sql = "SELECT DISTINCT tipo FROM plant_types";
    $result = mysqli_query($link, $sql);
    $plantTypes = array();
    if ($result) {
        while ($row = mysqli_fetch_assoc($result)) {
            $plantTypes[] = $row['tipo'];
        }
        mysqli_free_result($result);
    }
    
    mysqli_close($link);
    return $plantTypes;
}

?>