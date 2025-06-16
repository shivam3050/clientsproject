# Create exact 256KB string (262,144 bytes)
custom_string = "X" * 262144  # Exactly 256KB

# Open file in write mode
file = open("25MB_counting_file.txt", "w")

# Write numbers with 256KB string (total ~25MB)
number = 1
while number <= 100:  # 100 entries × ~256KB = ~25MB
    file.write(f"{number}\n{custom_string}\n")
    number += 1

file.close()
print("25MB file created successfully!")