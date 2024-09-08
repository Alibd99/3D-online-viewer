import bpy

def create_cone():
    # Ensure the scene is cleared of any existing objects
    bpy.ops.object.select_all(action='DESELECT')
    bpy.ops.object.select_all(action='SELECT')
    bpy.ops.object.delete()

    # Create a cone
    bpy.ops.mesh.primitive_cone_add(radius1=1, depth=2, location=(0, 0, 0))
    
    # Get the created cone object
    cone = bpy.context.object
    
    # Add a new material
    material = bpy.data.materials.new(name="ConeMaterial")
    material.use_nodes = True
    
    # Get the material's node tree
    nodes = material.node_tree.nodes
    principled_bsdf = nodes.get("Principled BSDF")
    
    # Set the color (RGBA)
    principled_bsdf.inputs["Base Color"].default_value = (1, 0, 0, 1)  # Red color
    
    # Assign the material to the cone
    if cone.data.materials:
        cone.data.materials[0] = material
    else:
        cone.data.materials.append(material)

def export_scene(export_path):
    try:
        bpy.ops.export_scene.gltf(filepath=export_path, export_format='GLB')
        print(f"Exported scene to {export_path}")
        return True
    except Exception as e:
        print(f"Error during export: {e}")
        return False

def perform_operations():
    create_cone()  # Create the cone and assign the material
    export_path = "/home/alosh/projects1/exam/public/models/model.glb"
    return export_scene(export_path)

if __name__ == "__main__":
    result = perform_operations()
    if not result:
        print("Export failed")
