from controlnet_aux import LineartDetector
import cv2
import numpy as np
import matplotlib.pyplot as plt

# Parameters
img_res = 512
kernel_size = 5
pixel_threshold = 120

debug = __name__ == "__main__"

def get_lineart(image):

    size = image.shape
    mul_factor = img_res / max(size)
    new_dim = (int(size[1] * mul_factor), int(size[0] * mul_factor))

    if mul_factor > 1:
        image = cv2.resize(image, new_dim, interpolation=cv2.INTER_CUBIC)
    else:
        image = cv2.resize(image, new_dim, interpolation=cv2.INTER_AREA)

    print("Loading processor...")
    processor = LineartDetector.from_pretrained("lllyasviel/Annotators")
    print("Processing image...")
    lineart = processor(image)
    lineart = np.array(lineart)[:, :, 0]

    if debug:
        plt.imshow(lineart, cmap="gray")
        plt.show()

    result = np.zeros_like(lineart)
    mid = kernel_size // 2

    for i in range(mid, lineart.shape[0] - mid, kernel_size):
        for j in range(mid, lineart.shape[1] - mid, kernel_size):
            block = lineart[i - mid : i + mid + 1, j - mid : j + mid + 1]

            if max(block.flatten()) < pixel_threshold:
                continue

            y, x = np.unravel_index(np.argmax(block), block.shape)
            result[i + y - mid, j + x - mid] = 255

    if debug:
        plt.imshow(result, cmap="gray")
        plt.show()
    
    print("Result shape=", result.shape)
    cv2.imwrite("../images/control.png", lineart)
    cv2.imwrite("../images/control_conv.png", result)
    
    return result


if __name__ == "__main__":
    imgName = "pi-symbol.png"  # "Robot.png"  "celeb1.jpeg"  "pi-symbol.png"
    image = cv2.imread("../images/" + imgName)
    
    get_lineart(image)