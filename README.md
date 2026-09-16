# google-photos-bulk-empty-album-delete
UI Vision script that automates empty album bulk deletion on Google Photos

## WARNING: HERE THERE BE DRAGONS 🐲
_I've only run this in [Vivaldi](https://vivaldi.com), which is a (much better) Chrome fork, YMMV. Use entirely at your own discretion. Not responsible if you nuke all your albums without saving backups._  If you're remotely concerned about doing that, it's only 3 clicks per album to do manually. 

I didn't want to manually delete 50+ empty albums from failed imports/backups and maybe you don't either. This script has a "preview" function that logs a list of albums to be deleted that requires manual approval; This is ***--the only safeguard--*** in place to prevent erroneous album deletion because this is a one-off, throwaway script.

**DELETED ALBUMS CANNOT BE RESTORED. THEY DON'T GO TO A RECYCLE BIN. THIS IS AN IMMUTABLE AND VERY PERMANENT ACTION. MAKE SURE YOU READ THE PREVIEW DELETION LIST BEFORE YOU FIRE ZE MISSLES.** 🚀

## How to Run - No Additional Code Needed
1. Download [UI Vision][[https://ui.vision](https://ui.vision/#get) in a supported browser
2. Open UI Vision
3. On the _Files_ tab, click the _New Folder_ icon and give your folder a name
4. Right Click the folder you just created and select _New macro_ - give it a name, too
5. Right Click the macro -> Edit
6. Copy-paste the contents of `/bulk-list-and-delete.js` from this repo and click _Save_
7. Click the blue _Play_ button at the bottom to run the macro
8. Sit back and watch it generate a list of empty albums
9. **Review the list carefully**
10. Only if you've confirmed the correct albums to delete, enter _APPROVED_ in the prompt when it pops up
11. ???
12. ~Profit~ Monitor as it loops through up to 100 empty albums (you can edit this parameter in the script or just hit Play again)
13. Ask Google to add bulk album management to render this totally irrelevant and/or wait for Photos to be added to https://killedbygoogle.com 🪦
