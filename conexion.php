<?php
    function conexion(){
        $host = 'bakmkys5zfkxrgkxfmki-mysql.services.clever-cloud.com';
        $user = 'ux8tdoxqchjuxlw3';
        $password = 'KeVnDkWjhNRh8j1bj9cu';
        $database = 'bakmkys5zfkxrgkxfmki';
        $port = 3306;

        $link = mysqli_connect($host, $user, $password, $database, $port);

        if(!$link){
            echo "Error conectando a base de datos: ". mysqli_connect_error();
            exit();
        }

        mysqli_set_charset($link, "utf8");

        echo "Conexión con la base de datos conseguida<br>";
        return $link;
    }

    function cerrarConexion($link){
        mysqli_close($link);
    }
?>