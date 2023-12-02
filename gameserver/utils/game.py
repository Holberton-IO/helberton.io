def check_is_dir_with_opposite(dir1, dir2):
    if dir1 == "up" and dir2 == "down":
        return True
    elif dir1 == "down" and dir2 == "up":
        return True
    elif dir1 == "left" and dir2 == "right":
        return True
    elif dir1 == "right" and dir2 == "left":
        return True
    else:
        return False