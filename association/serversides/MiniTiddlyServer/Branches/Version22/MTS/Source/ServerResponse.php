<?php

    class ServerResponse 
    {
        private $data;
        
        public function __construct() {
            $this->data = "var data = {";
        }
                
        public function setValue($key, $value) {
            $this->data = $this->data . "$key:$value,";
        }
        
        public function setBoolean($key, $value) {
            if ($value) $value = "true";
            else        $value = "false";
        
            $this->setValue($key,$value);
        }
        
        public function setString($key, $value) {
            $this->setValue($key,"\"".$value."\"");
        }
        
        public function throwError($message) {
            $this->setBoolean("error",true);
            $this->setString("message",$message);
        }
        
        public function throwCriticalError($message) {
            $this->throwError($message);
            $this->send();
            exit();
        }
        
        // Flushes data and exits // 
        public function send() {
            echo $this->data . "end:true};"; // AND THE endl thing?? // No, that was C++
            exit();
        }
    }

?>