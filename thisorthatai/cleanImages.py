import os
import glob

def delete_files_in_directory(directory):
    os.chdir(directory)
    for file in glob.glob('*(*).*'):
        os.remove(file)
        print(f'Deleted file: {file}')
    for file in glob.glob('*'):
        if len(file.split("_")) != 5:
            os.remove(file)
            print(f'Deleted file: {file}')

if __name__ == "__main__":
    directory = './images'
    delete_files_in_directory(directory)