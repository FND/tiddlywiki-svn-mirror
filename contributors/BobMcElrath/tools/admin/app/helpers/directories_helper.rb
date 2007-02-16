module DirectoriesHelper             
  
def createDirectoryOnDisk(dirname) 
  #check if dir exists, if so no op
  
  #create dir 
  
  
  
end

def listUsers(htaccessFile = '/Users/leegonzales/development/tiddlerbackend/htaccessSample')
    arr = Array.new
    File.open(htaccessFile) do |file|
        file.each_line do |line|
            arr.push(line.split(':')[0])
        end
    end
    return arr
end                                                                                             

end






