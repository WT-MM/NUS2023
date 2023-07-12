import glob
import random

class Retrieve:
    
    def __init__(self, addr, rootLevel=True):
        self.rootDir = addr
        self.findImgs(rootLevel=rootLevel)
        

    def findImgs(self, rootLevel=True, shuffle=True):
        self.imgs = []
        search = ['/*.png','/*.jpg','/*.jpeg','/*.gif']
        
        if(not rootLevel):
            search = ['/*' + i for i in search]


        for i in search:
            self.imgs.extend(glob.glob(self.rootDir+i))

        if(shuffle):
            random.shuffle(self.imgs)

        return self.imgs
   